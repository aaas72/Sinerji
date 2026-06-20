"""
Seed the skill_ontology table with the local taxonomy.
Run: python seed_ontology.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.skill_taxonomy import SKILL_TAXONOMY
from app.core.config import DATABASE_URL
import psycopg  # type: ignore

def seed():
    conn = psycopg.connect(DATABASE_URL)
    cur = conn.cursor()

    # Ensure table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS skill_ontology (
            id SERIAL PRIMARY KEY,
            skill_name VARCHAR(255) NOT NULL,
            parent_name VARCHAR(255) NOT NULL,
            UNIQUE(skill_name, parent_name)
        )
    """)

    inserted = 0
    skipped = 0
    for skill, parents in SKILL_TAXONOMY.items():
        for parent in parents:
            try:
                cur.execute(
                    "INSERT INTO skill_ontology (skill_name, parent_name) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (skill.lower().strip(), parent.lower().strip()),
                )
                if cur.rowcount > 0:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                print(f"  [ERROR] {skill} -> {parent}: {e}")

    conn.commit()
    cur.execute("SELECT count(*) FROM skill_ontology")
    total = cur.fetchone()[0]
    conn.close()

    print("===========================================")
    print("  Sinerji Skill Ontology Seeder")
    print("===========================================")
    print(f"  Skills in taxonomy : {len(SKILL_TAXONOMY)}")
    print(f"  Inserted           : {inserted}")
    print(f"  Skipped (existing) : {skipped}")
    print(f"  Total in DB        : {total}")
    print("===========================================")

if __name__ == "__main__":
    seed()
