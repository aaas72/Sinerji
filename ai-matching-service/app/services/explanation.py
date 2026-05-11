from typing import List

def generate_local_explanation(
    score: float,
    matched_skills: List[str],
    missing_skills: List[str],
    semantic_level: str,
    hard_score: float = 0.0,
    semantic_score: float = 0.0,
) -> str:
    """Generate a professional Turkish explanation with score breakdown."""
    percentage = round(score * 100, 2)

    if score >= 0.85:
        header = f"Bu aday, %{percentage} eşleşme oranıyla görev için mükemmel bir adaydır."
        body = f"Analiz, ({', '.join(matched_skills[:3])}) gibi temel yeteneklerde mükemmel bir uyum gösteriyor."
        closing = "Öğrencinin kariyer yolu ve geçmiş deneyimleri bu projenin beklentileriyle derinlemesine örtüşüyor."
    elif score >= 0.65:
        header = f"Çok iyi bir aday, %{percentage} eşleşme oranına ulaştı."
        body = f"Öğrenci, {', '.join(matched_skills[:3])} konularında sağlam bir temele sahip."
        if missing_skills:
            body += f" Ancak, ({', '.join(missing_skills[:2])}) konularında küçük bir gelişime ihtiyaç duyabilir."
        closing = "Öğrencinin geçmiş deneyimleri, proje görevlerini başarıyla yürütmek için iyi bir altyapı sağlıyor."
    else:
        header = f"Mevcut eşleşme oranı %{percentage}."
        body = "Bazı yönlerde uyum olsa da, aday temel teknik gereksinimlerden bazılarını karşılamıyor olabilir."
        if missing_skills:
            body += f" Eksiklikler temel olarak şunlarda yoğunlaşıyor: {', '.join(missing_skills[:3])}."
        closing = "Bu aday daha az karmaşık görevler için değerlendirilebilir veya yoğun bir eğitim verilebilir."

    breakdown = f"\n\n📊 Yetenek Uyumu: %{round(hard_score, 1)} | Bağlamsal Uyum: %{round(semantic_score, 1)}"
    return f"{header}\n\n{body}\n\n{closing}{breakdown}"
