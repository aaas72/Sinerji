"""
Sinerji Skill Embedding Fine-Tuner
====================================
Trains a domain-specific skill matching model using our own ontology as
labeled training data -- completely free, runs offline, no API needed.

RUNNING:  python scripts/train_skill_embeddings.py
OUTPUT:   models/sinerji-skill-matcher/
USAGE:    The service auto-detects and loads this model on next restart.
"""

from __future__ import annotations

import random
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from datasets import Dataset as HFDataset
from sentence_transformers import SentenceTransformer, evaluation, losses, util
from sentence_transformers.trainer import SentenceTransformerTrainer
from sentence_transformers.training_args import SentenceTransformerTrainingArguments

from app.skill_ontology import _RAW_IMPLIES

# ── Config ────────────────────────────────────────────────────────────────────
BASE_MODEL      = "sentence-transformers/all-MiniLM-L6-v2"
OUTPUT_DIR      = ROOT / "models" / "sinerji-skill-matcher"
EPOCHS          = 15
BATCH_SIZE      = 16
WARMUP_RATIO    = 0.1
NEGATIVES_RATIO = 2.0
SEED            = 42
random.seed(SEED)


# ── Build dataset ─────────────────────────────────────────────────────────────

def build_training_data():
    all_skills = list(_RAW_IMPLIES.keys())
    s1_list, s2_list, label_list = [], [], []

    for skill, implications in _RAW_IMPLIES.items():
        for implied_skill, confidence in implications:
            # Forward: Django -> Python (0.97)
            s1_list.append(f"skill: {skill}")
            s2_list.append(f"skill: {implied_skill}")
            label_list.append(float(confidence))

            # Symmetric with reduced confidence
            sym = round(confidence * 0.65, 2)
            if sym >= 0.30:
                s1_list.append(f"skill: {implied_skill}")
                s2_list.append(f"skill: {skill}")
                label_list.append(sym)

    # Build reverse index to avoid marking related pairs as negatives
    reverse_index: dict = {}
    for skill, implications in _RAW_IMPLIES.items():
        for implied, _ in implications:
            reverse_index.setdefault(implied, set()).add(skill)
            reverse_index.setdefault(skill, set()).add(implied)

    # Generate negatives (unrelated pairs)
    neg_count = int(len(s1_list) * NEGATIVES_RATIO)
    neg_added, attempts = 0, 0
    while neg_added < neg_count and attempts < neg_count * 10:
        attempts += 1
        a = random.choice(all_skills)
        b = random.choice(all_skills)
        if a == b:
            continue
        related = reverse_index.get(a, set()) | {
            impl for impl, _ in _RAW_IMPLIES.get(a, [])
        }
        if b not in related:
            s1_list.append(f"skill: {a}")
            s2_list.append(f"skill: {b}")
            label_list.append(0.02)
            neg_added += 1

    print(f"  Positives+symmetric: {len(s1_list) - neg_added}")
    print(f"  Negatives:           {neg_added}")

    # Shuffle
    combined = list(zip(s1_list, s2_list, label_list))
    random.shuffle(combined)
    s1s, s2s, lbls = zip(*combined)

    cutoff = int(len(s1s) * 0.85)
    train_ds = HFDataset.from_dict({
        "sentence1": list(s1s[:cutoff]),
        "sentence2": list(s2s[:cutoff]),
        "label":     list(lbls[:cutoff]),
    })
    eval_ds = HFDataset.from_dict({
        "sentence1": list(s1s[cutoff:]),
        "sentence2": list(s2s[cutoff:]),
        "label":     list(lbls[cutoff:]),
    })
    return train_ds, eval_ds


# ── Demo comparison ───────────────────────────────────────────────────────────

DEMO_PAIRS = [
    ("Next.js",             "React",              0.92),
    ("Django",              "Python",             0.97),
    ("Figma",               "UI design",          0.92),
    ("Unity",               "game development",   0.97),
    ("Solidity",            "blockchain",         0.95),
    ("Power BI",            "data visualization", 0.95),
    ("Penetration Testing", "cybersecurity",      0.95),
    ("Arduino",             "embedded systems",   0.92),
    # Should be LOW:
    ("Django",              "Figma",              0.02),
    ("React",               "blockchain",         0.02),
    ("Unity",               "data analysis",      0.02),
]


def print_comparison(model: SentenceTransformer, title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(f"  {'Pair':<42} {'Got':>6}  {'Want':>5}  {'OK?':>4}")
    print(f"  {'-'*42} {'-'*6}  {'-'*5}  {'-'*4}")
    for s1, s2, expected in DEMO_PAIRS:
        sim = float(util.cos_sim(
            model.encode(f"skill: {s1}", normalize_embeddings=True),
            model.encode(f"skill: {s2}", normalize_embeddings=True),
        ))
        want = "HIGH" if expected >= 0.5 else "LOW"
        ok = "OK" if (
            (want == "HIGH" and sim >= 0.65) or
            (want == "LOW"  and sim <= 0.25)
        ) else "!!"
        print(f"  {s1:<20} ~ {s2:<20} {sim:>6.3f}  {want:<5}  {ok}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print("\n" + "="*60)
    print("  Sinerji Skill Embedding Fine-Tuner")
    print("="*60)

    # 1. Load base model
    print(f"\n[1/5] Loading base model: {BASE_MODEL}")
    model = SentenceTransformer(BASE_MODEL)

    # 2. Baseline
    print("[2/5] Baseline BEFORE training:")
    print_comparison(model, "BEFORE FINE-TUNING")

    # 3. Build data
    print("\n[3/5] Building training data from ontology...")
    train_ds, eval_ds = build_training_data()
    print(f"  Train: {len(train_ds)}  |  Eval: {len(eval_ds)}")

    # 4. Set up training
    train_loss = losses.CosineSimilarityLoss(model)
    evaluator  = evaluation.EmbeddingSimilarityEvaluator(
        sentences1=eval_ds["sentence1"],
        sentences2=eval_ds["sentence2"],
        scores=eval_ds["label"],
        name="skill-eval",
        show_progress_bar=False,
    )
    warmup = int((len(train_ds) // BATCH_SIZE) * EPOCHS * WARMUP_RATIO)
    args = SentenceTransformerTrainingArguments(
        output_dir=str(OUTPUT_DIR),
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        warmup_steps=warmup,
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="eval_skill-eval_spearman_cosine",
        greater_is_better=True,
        eval_strategy="epoch",
        logging_steps=50,
        seed=SEED,
        fp16=False,
    )

    # 5. Train
    print(f"\n[4/5] Fine-tuning for {EPOCHS} epochs (warmup={warmup} steps)...")
    t0 = time.time()
    trainer = SentenceTransformerTrainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        loss=train_loss,
        evaluator=evaluator,
    )
    trainer.train()
    elapsed = time.time() - t0
    print(f"  Done in {elapsed:.0f}s ({elapsed/60:.1f} min)")

    # Save best model
    model.save(str(OUTPUT_DIR))

    # 6. Results
    print("\n[5/5] Results AFTER fine-tuning:")
    best = SentenceTransformer(str(OUTPUT_DIR))
    print_comparison(best, "AFTER FINE-TUNING")

    print(f"\n{'='*60}")
    print(f"  Model saved: {OUTPUT_DIR}")
    print(f"  The AI service will auto-load it on next restart.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
