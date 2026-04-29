import psycopg
import os
import json
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL').replace('?schema=public', '')

def seed():
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            # 1. Get skill IDs
            cur.execute("SELECT id, name FROM skills")
            skill_map = {name: id for id, name in cur.fetchall()}
            
            target_skills = [
                "Google Analytics", "SEO", "Sosyal Medya Yönetimi", 
                "Google Ads", "İçerik Üretimi & Copywriting", 
                "Temel HTML/CSS bilgisi", "Anahtar Kelime Araştırması (Keyword Research)"
            ]
            
            # 2. Create 4 users
            student_data = [
                {
                    "name": "Ahmed Perfect",
                    "email": "ahmed@example.com",
                    "bio": "Expert digital marketer with 5 years of experience in Google Ads, SEO and Analytics.",
                    "skills": {s: 9 for s in target_skills}
                },
                {
                    "name": "Sara MissingOne",
                    "email": "sara@example.com",
                    "bio": "SEO specialist and content creator. I handle social media and analytics but don't do Google Ads.",
                    "skills": {s: 8 for s in target_skills if s != "Google Ads"}
                },
                {
                    "name": "John Weak",
                    "email": "john@example.com",
                    "bio": "Junior marketer starting with SEO.",
                    "skills": {"SEO": 5, "Google Analytics": 4}
                },
                {
                    "name": "Semantic Sam",
                    "email": "sam@example.com",
                    "bio": "I am a professional in Digital Marketing, expert in SEO strategies, Social Media Management, and Google Ads campaigns. I love analytics.",
                    "skills": {} # No structured skills
                }
            ]
            
            task_id = 13
            
            for i, data in enumerate(student_data):
                # Create User
                cur.execute(
                    "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, 'STUDENT') RETURNING id",
                    (data['email'], 'hashed_password', )
                )
                user_id = cur.fetchone()[0]
                
                # Create Profile
                cur.execute(
                    "INSERT INTO student_profiles (user_id, full_name, bio) VALUES (%s, %s, %s)",
                    (user_id, data['name'], data['bio'])
                )
                
                # Add Skills
                for s_name, level in data['skills'].items():
                    s_id = skill_map.get(s_name)
                    if s_id:
                        cur.execute(
                            "INSERT INTO student_skills (student_user_id, skill_id, level) VALUES (%s, %s, %s)",
                            (user_id, s_id, level)
                        )
                
                # Create Submission
                cur.execute(
                    "INSERT INTO submissions (task_id, student_user_id, status, submission_content) VALUES (%s, %s, 'pending', %s)",
                    (task_id, user_id, f"Application for task from {data['name']}")
                )
                
            print("Seeded 4 students and submissions.")

if __name__ == "__main__":
    seed()
