"""
Skill Ontology â€“ Hierarchical & relational knowledge graph for tech skills.

This module encodes two types of relationships:

  SKILL_IMPLIES[student_skill] = [(required_skill, confidence), ...]

  Meaning: "A student who knows X is likely to also know Y at `confidence` level."

  Examples:
    "react"    â†’ ("javascript", 0.92)   react IS javascript-based
    "django"   â†’ ("python",     0.95)   django IS a python framework
    "next.js"  â†’ ("react",      0.88)   next.js BUILDS ON react
    "next.js"  â†’ ("javascript", 0.90)   transitively through react

Usage in matching
-----------------
When the student has skill S and the task requires skill R:
  confidence = get_implication_confidence(S, R)
  if confidence > 0:
      satisfaction = confidence * level_ratio   # instead of 0 (missing)

Transitivity
------------
One level of transitivity is supported automatically:
  if  A â†’ B (c1)  and  B â†’ R (c2)
  then A â†’ R via B  at  c1 * c2 * TRANSITIVE_DECAY
"""

from __future__ import annotations

from functools import lru_cache
from typing import Dict, List, Optional, Tuple

from app.utils import canonicalize_skill_name

# â”€â”€ Decay factor for transitive inferences â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
TRANSITIVE_DECAY = 0.85   # Aâ†’Bâ†’R gets penalised vs Aâ†’R direct

# â”€â”€ Core ontology â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Format: canonical_skill â†’ [(canonical_implied_skill, confidence [0,1])]
# Keep all keys & values in canonical (lowercase) form.

_RAW_IMPLIES: Dict[str, List[Tuple[str, float]]] = {

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # JAVASCRIPT ECOSYSTEM
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "javascript": [
        ("html",         0.70),
        ("css",          0.55),
        ("web development", 0.75),
    ],
    "typescript": [
        ("javascript",   0.92),
        ("html",         0.65),
        ("web development", 0.72),
    ],

    # Frontend Frameworks
    "react": [
        ("javascript",   0.95),
        ("html",         0.75),
        ("css",          0.60),
        ("frontend",     0.85),
        ("web development", 0.80),
    ],
    "vue.js": [
        ("javascript",   0.93),
        ("html",         0.75),
        ("css",          0.65),
        ("frontend",     0.85),
        ("web development", 0.80),
    ],
    "angular": [
        ("typescript",   0.88),
        ("javascript",   0.90),
        ("html",         0.75),
        ("css",          0.65),
        ("frontend",     0.85),
    ],
    "svelte": [
        ("javascript",   0.90),
        ("html",         0.80),
        ("css",          0.70),
        ("frontend",     0.80),
    ],

    # Meta-frameworks
    "next.js": [
        ("react",        0.92),
        ("javascript",   0.92),
        ("typescript",   0.65),
        ("frontend",     0.82),
        ("full-stack",   0.60),
    ],
    "nuxt.js": [
        ("vue.js",       0.92),
        ("javascript",   0.90),
        ("frontend",     0.82),
    ],
    "remix": [
        ("react",        0.88),
        ("javascript",   0.88),
        ("frontend",     0.80),
    ],
    "gatsby": [
        ("react",        0.88),
        ("graphql",      0.55),
        ("javascript",   0.88),
    ],

    # Node / Server-side JS
    "node.js": [
        ("javascript",   0.90),
        ("backend",      0.72),
    ],
    "express": [
        ("node.js",      0.92),
        ("javascript",   0.88),
        ("rest api",     0.70),
        ("backend",      0.75),
    ],
    "nestjs": [
        ("node.js",      0.90),
        ("typescript",   0.85),
        ("javascript",   0.88),
        ("rest api",     0.72),
        ("backend",      0.78),
    ],
    "fastify": [
        ("node.js",      0.90),
        ("javascript",   0.88),
        ("rest api",     0.68),
        ("backend",      0.75),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # PYTHON ECOSYSTEM
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "python": [
        ("backend",      0.65),
        ("scripting",    0.70),
    ],
    "django": [
        ("python",       0.97),
        ("rest api",     0.70),
        ("backend",      0.80),
        ("web development", 0.75),
        ("sql",          0.60),
    ],
    "fastapi": [
        ("python",       0.97),
        ("rest api",     0.85),
        ("backend",      0.82),
        ("web development", 0.72),
    ],
    "flask": [
        ("python",       0.97),
        ("rest api",     0.72),
        ("backend",      0.75),
        ("web development", 0.68),
    ],

    # Data Science / ML
    "tensorflow": [
        ("python",       0.92),
        ("machine learning", 0.88),
        ("deep learning",    0.85),
        ("data science",     0.72),
    ],
    "pytorch": [
        ("python",       0.92),
        ("machine learning", 0.88),
        ("deep learning",    0.88),
        ("data science",     0.72),
    ],
    "scikit-learn": [
        ("python",       0.90),
        ("machine learning", 0.82),
        ("data science",     0.78),
    ],
    "keras": [
        ("python",       0.88),
        ("deep learning",    0.85),
        ("machine learning", 0.82),
    ],
    "pandas": [
        ("python",       0.90),
        ("data analysis",    0.88),
        ("data science",     0.72),
    ],
    "numpy": [
        ("python",       0.85),
        ("data analysis",    0.70),
        ("data science",     0.60),
    ],
    "matplotlib": [
        ("python",       0.82),
        ("data visualization", 0.85),
        ("data analysis",      0.65),
    ],
    "seaborn": [
        ("python",       0.82),
        ("matplotlib",       0.72),
        ("data visualization", 0.85),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # JAVA ECOSYSTEM
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "java": [
        ("object-oriented programming", 0.88),
        ("backend",      0.65),
    ],
    "spring": [
        ("java",         0.97),
        ("backend",      0.82),
        ("rest api",     0.72),
    ],
    "spring boot": [
        ("java",         0.97),
        ("spring",       0.92),
        ("backend",      0.85),
        ("rest api",     0.78),
        ("microservices",    0.65),
    ],
    "hibernate": [
        ("java",         0.92),
        ("sql",          0.65),
        ("orm",          0.88),
    ],
    "maven": [
        ("java",         0.82),
    ],
    "gradle": [
        ("java",         0.80),
        ("kotlin",       0.55),
    ],
    "kotlin": [
        ("java",         0.72),
        ("android development", 0.80),
        ("object-oriented programming", 0.85),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # PHP ECOSYSTEM
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "php": [
        ("web development", 0.72),
        ("backend",      0.70),
    ],
    "laravel": [
        ("php",          0.97),
        ("rest api",     0.72),
        ("backend",      0.80),
        ("sql",          0.60),
    ],
    "symfony": [
        ("php",          0.95),
        ("backend",      0.78),
    ],
    "wordpress": [
        ("php",          0.72),
        ("html",         0.65),
        ("css",          0.55),
        ("web development", 0.65),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # RUBY ECOSYSTEM
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "ruby": [
        ("object-oriented programming", 0.82),
        ("backend",      0.62),
    ],
    "rails": [
        ("ruby",         0.97),
        ("rest api",     0.72),
        ("backend",      0.80),
        ("sql",          0.62),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # C / C++ / C# ECOSYSTEM
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "c#": [
        ("object-oriented programming", 0.88),
        ("backend",      0.62),
    ],
    ".net": [
        ("c#",           0.85),
        ("backend",      0.75),
        ("rest api",     0.65),
    ],
    "asp.net": [
        ("c#",           0.90),
        (".net",         0.88),
        ("backend",      0.80),
        ("rest api",     0.75),
    ],
    "c++": [
        ("c",            0.78),
        ("object-oriented programming", 0.82),
        ("systems programming", 0.80),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # MOBILE DEVELOPMENT
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "swift": [
        ("ios development",  0.92),
        ("mobile development", 0.85),
        ("object-oriented programming", 0.82),
    ],
    "objective-c": [
        ("ios development",  0.85),
        ("mobile development", 0.80),
    ],
    "kotlin": [
        ("android development", 0.88),
        ("mobile development",  0.82),
        ("java",               0.72),
    ],
    "react native": [
        ("react",              0.82),
        ("javascript",         0.88),
        ("mobile development", 0.88),
        ("ios development",    0.60),
        ("android development", 0.60),
    ],
    "flutter": [
        ("dart",               0.95),
        ("mobile development", 0.90),
        ("ios development",    0.65),
        ("android development", 0.65),
    ],
    "dart": [
        ("object-oriented programming", 0.80),
        ("mobile development", 0.65),
    ],
    "ionic": [
        ("angular",            0.72),
        ("javascript",         0.82),
        ("mobile development", 0.82),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # DATABASES
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "postgresql": [
        ("sql",          0.95),
        ("database",     0.90),
        ("relational databases", 0.92),
    ],
    "mysql": [
        ("sql",          0.95),
        ("database",     0.88),
        ("relational databases", 0.90),
    ],
    "sqlite": [
        ("sql",          0.88),
        ("database",     0.80),
    ],
    "mongodb": [
        ("nosql",        0.92),
        ("database",     0.88),
    ],
    "redis": [
        ("database",     0.72),
        ("caching",      0.88),
        ("nosql",        0.70),
    ],
    "elasticsearch": [
        ("nosql",        0.70),
        ("database",     0.72),
        ("search",       0.90),
    ],
    "cassandra": [
        ("nosql",        0.90),
        ("database",     0.82),
    ],
    "firebase": [
        ("nosql",        0.72),
        ("database",     0.75),
        ("cloud computing", 0.60),
    ],
    "prisma": [
        ("sql",          0.70),
        ("orm",          0.90),
        ("node.js",      0.65),
        ("typescript",   0.65),
    ],
    "sequelize": [
        ("sql",          0.72),
        ("orm",          0.88),
        ("node.js",      0.70),
    ],
    "sqlalchemy": [
        ("sql",          0.75),
        ("orm",          0.90),
        ("python",       0.82),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # DEVOPS & CLOUD
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "docker": [
        ("linux",        0.68),
        ("devops",       0.82),
        ("containerization", 0.95),
    ],
    "kubernetes": [
        ("docker",       0.85),
        ("devops",       0.88),
        ("containerization", 0.82),
        ("cloud computing",  0.72),
        ("microservices",    0.75),
    ],
    "aws": [
        ("cloud computing",  0.92),
        ("devops",       0.68),
        ("linux",        0.55),
    ],
    "azure": [
        ("cloud computing",  0.92),
        ("devops",       0.65),
    ],
    "gcp": [
        ("cloud computing",  0.92),
        ("devops",       0.65),
    ],
    "terraform": [
        ("devops",       0.85),
        ("cloud computing",  0.72),
        ("infrastructure as code", 0.95),
    ],
    "ansible": [
        ("devops",       0.85),
        ("linux",        0.70),
        ("automation",   0.82),
    ],
    "jenkins": [
        ("devops",       0.82),
        ("ci/cd",        0.90),
    ],
    "github actions": [
        ("devops",       0.78),
        ("ci/cd",        0.90),
        ("git",          0.72),
    ],
    "gitlab ci": [
        ("devops",       0.78),
        ("ci/cd",        0.90),
        ("git",          0.72),
    ],
    "nginx": [
        ("devops",       0.72),
        ("linux",        0.65),
        ("web server",   0.92),
    ],
    "linux": [
        ("bash",         0.70),
        ("devops",       0.60),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # APIs & ARCHITECTURE
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "graphql": [
        ("rest api",     0.65),
        ("api design",   0.82),
    ],
    "rest api": [
        ("api design",   0.88),
        ("http",         0.75),
        ("backend",      0.60),
    ],
    "grpc": [
        ("rest api",     0.60),
        ("api design",   0.78),
        ("microservices",    0.72),
    ],
    "microservices": [
        ("backend",      0.70),
        ("api design",   0.68),
        ("system design",    0.72),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # VERSION CONTROL & TOOLS
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "git": [
        ("version control",  0.95),
    ],
    "github": [
        ("git",          0.92),
        ("version control",  0.88),
    ],
    "gitlab": [
        ("git",          0.90),
        ("version control",  0.88),
        ("ci/cd",        0.65),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # WEB FUNDAMENTALS
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "html": [
        ("web development",  0.72),
        ("frontend",     0.65),
    ],
    "css": [
        ("web development",  0.70),
        ("frontend",     0.68),
    ],
    "sass": [
        ("css",          0.92),
        ("frontend",     0.70),
    ],
    "tailwind css": [
        ("css",          0.85),
        ("frontend",     0.72),
    ],
    "bootstrap": [
        ("css",          0.80),
        ("html",         0.72),
        ("frontend",     0.70),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # TESTING
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "jest": [
        ("javascript",   0.82),
        ("testing",      0.92),
        ("unit testing", 0.88),
    ],
    "cypress": [
        ("javascript",   0.72),
        ("testing",      0.88),
        ("e2e testing",  0.95),
    ],
    "pytest": [
        ("python",       0.88),
        ("testing",      0.92),
        ("unit testing", 0.88),
    ],
    "junit": [
        ("java",         0.88),
        ("testing",      0.90),
        ("unit testing", 0.90),
    ],
    "selenium": [
        ("testing",      0.82),
        ("e2e testing",  0.88),
    ],

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # DATA ENGINEERING
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "apache spark": [
        ("python",       0.65),
        ("big data",     0.90),
        ("data engineering", 0.85),
        ("scala",        0.55),
    ],
    "apache kafka": [
        ("message queuing",  0.92),
        ("data engineering", 0.80),
        ("microservices",    0.65),
    ],
    "airflow": [
        ("python",       0.78),
        ("data engineering", 0.85),
        ("workflow automation", 0.80),
    ],
    "dbt": [
        ("sql",          0.80),
        ("data engineering", 0.82),
        ("data warehouse",   0.78),
    ],

    # ── Design & UX ─────────────────────────────────────────────────────────
    "figma": [
        ("ui design",        0.92),
        ("ux design",        0.85),
        ("ui/ux design",     0.92),
        ("prototyping",      0.85),
        ("wireframing",      0.82),
        ("design",           0.80),
    ],
    "adobe xd": [
        ("ui design",        0.90),
        ("ux design",        0.82),
        ("ui/ux design",     0.88),
        ("prototyping",      0.82),
        ("design",           0.78),
    ],
    "sketch": [
        ("ui design",        0.90),
        ("ux design",        0.80),
        ("ui/ux design",     0.88),
        ("design",           0.75),
    ],
    "ui design": [("design", 0.90), ("visual design", 0.85)],
    "ux design": [("design", 0.88), ("user research", 0.78), ("wireframing", 0.80), ("prototyping", 0.75)],
    "ui/ux design": [("ui design", 0.95), ("ux design", 0.95), ("design", 0.92), ("prototyping", 0.82), ("wireframing", 0.82)],
    # ── Creative / Media ───────────────────────────────────────────────────
    "photoshop": [("graphic design", 0.88), ("image editing", 0.97), ("photo editing", 0.97), ("visual design", 0.82), ("design", 0.78)],
    "illustrator": [("graphic design", 0.92), ("vector graphics", 0.97), ("visual design", 0.85), ("design", 0.82)],
    "indesign": [("graphic design", 0.88), ("print design", 0.92), ("layout design", 0.90), ("design", 0.78)],
    "after effects": [("motion graphics", 0.97), ("video editing", 0.72), ("animation", 0.85), ("visual effects", 0.88)],
    "premiere pro": [("video editing", 0.97), ("video production", 0.88), ("post-production", 0.82)],
    "final cut pro": [("video editing", 0.97), ("video production", 0.88), ("post-production", 0.82)],
    "davinci resolve": [("video editing", 0.95), ("color grading", 0.92), ("video production", 0.85)],
    "lightroom": [("photo editing", 0.95), ("photography", 0.80), ("image editing", 0.90)],
    # ── 3D & CAD ──────────────────────────────────────────────────────────
    "blender": [("3d modeling", 0.95), ("3d animation", 0.85), ("rendering", 0.78)],
    "maya": [("3d modeling", 0.92), ("3d animation", 0.92), ("visual effects", 0.78), ("rendering", 0.75)],
    "autocad": [("cad", 0.97), ("engineering design", 0.88), ("technical drawing", 0.90), ("drafting", 0.85)],
    "solidworks": [("cad", 0.95), ("mechanical design", 0.92), ("engineering design", 0.88), ("3d modeling", 0.80)],
    # ── Game Development ──────────────────────────────────────────────────
    "unity": [("game development", 0.97), ("c#", 0.88), ("vr development", 0.65), ("ar development", 0.65)],
    "unreal engine": [("game development", 0.97), ("c++", 0.82), ("3d development", 0.88), ("vr development", 0.68)],
    "godot": [("game development", 0.95), ("2d development", 0.88)],
    "pygame": [("game development", 0.85), ("python", 0.90)],
    # ── Blockchain / Web3 ─────────────────────────────────────────────────
    "solidity": [("blockchain", 0.95), ("smart contracts", 0.97), ("ethereum", 0.88), ("web3", 0.85)],
    "web3.js": [("blockchain", 0.88), ("web3", 0.95), ("javascript", 0.90), ("ethereum", 0.82)],
    "ethers.js": [("blockchain", 0.88), ("web3", 0.95), ("javascript", 0.90), ("ethereum", 0.85)],
    "hardhat": [("blockchain", 0.85), ("smart contracts", 0.88), ("ethereum", 0.82)],
    "ethereum": [("blockchain", 0.92), ("web3", 0.85)],
    # ── Business Intelligence ──────────────────────────────────────────────
    "power bi": [("data visualization", 0.95), ("business intelligence", 0.97), ("data analytics", 0.88), ("sql", 0.65), ("data analysis", 0.85), ("reporting", 0.80)],
    "tableau": [("data visualization", 0.95), ("business intelligence", 0.92), ("data analytics", 0.85), ("data analysis", 0.82)],
    "looker": [("data visualization", 0.90), ("business intelligence", 0.92), ("data analytics", 0.82), ("sql", 0.70)],
    "google analytics": [("data analytics", 0.88), ("web analytics", 0.97), ("digital marketing", 0.70)],
    "excel": [("data analysis", 0.82), ("spreadsheets", 0.97), ("reporting", 0.72)],
    # ── Marketing & SEO ───────────────────────────────────────────────────
    "seo": [("digital marketing", 0.85), ("content marketing", 0.72), ("web analytics", 0.70), ("marketing", 0.80)],
    "google ads": [("sem", 0.92), ("paid advertising", 0.90), ("digital marketing", 0.85), ("marketing", 0.78)],
    "facebook ads": [("paid advertising", 0.90), ("social media marketing", 0.85), ("digital marketing", 0.82), ("marketing", 0.78)],
    "social media marketing": [("digital marketing", 0.88), ("content creation", 0.75), ("marketing", 0.82)],
    "copywriting": [("content writing", 0.88), ("marketing", 0.72), ("writing", 0.85)],
    # ── Cybersecurity ──────────────────────────────────────────────────────
    "penetration testing": [("cybersecurity", 0.95), ("ethical hacking", 0.92), ("network security", 0.80), ("security", 0.88)],
    "ethical hacking": [("cybersecurity", 0.95), ("penetration testing", 0.88), ("network security", 0.80), ("security", 0.88)],
    "kali linux": [("linux", 0.85), ("penetration testing", 0.85), ("cybersecurity", 0.88), ("ethical hacking", 0.80)],
    "wireshark": [("network security", 0.88), ("cybersecurity", 0.82), ("networking", 0.80)],
    "burp suite": [("penetration testing", 0.90), ("web security", 0.92), ("cybersecurity", 0.85)],
    "network security": [("cybersecurity", 0.92), ("networking", 0.80), ("security", 0.88)],
    # ── Embedded Systems ──────────────────────────────────────────────────
    "arduino": [("embedded systems", 0.92), ("c++", 0.72), ("electronics", 0.80), ("iot", 0.80)],
    "raspberry pi": [("embedded systems", 0.88), ("linux", 0.72), ("python", 0.65), ("iot", 0.85)],
    "stm32": [("embedded systems", 0.95), ("c", 0.85), ("microcontrollers", 0.92), ("electronics", 0.78)],
    "rtos": [("embedded systems", 0.92), ("c", 0.78), ("real-time systems", 0.97), ("microcontrollers", 0.80)],
    "fpga": [("embedded systems", 0.88), ("hardware", 0.85), ("electronics", 0.80)],
    "vhdl": [("fpga", 0.80), ("hardware", 0.85), ("embedded systems", 0.78)],
    # ── AR / VR ───────────────────────────────────────────────────────────
    "arkit": [("ar development", 0.95), ("augmented reality", 0.95), ("ios development", 0.80), ("swift", 0.72)],
    "arcore": [("ar development", 0.95), ("augmented reality", 0.95), ("android development", 0.78)],
    "webxr": [("ar development", 0.80), ("vr development", 0.80), ("javascript", 0.82), ("web development", 0.75)],
    # ── Project Management ────────────────────────────────────────────────
    "jira": [("project management", 0.85), ("agile", 0.82), ("scrum", 0.78)],
    "confluence": [("documentation", 0.90), ("project management", 0.72)],
    "trello": [("project management", 0.82), ("agile", 0.72)],
    "asana": [("project management", 0.88)],
    "scrum": [("agile", 0.95), ("project management", 0.85)],
    "agile": [("project management", 0.85)],
    # ── Networking ────────────────────────────────────────────────────────
    "cisco": [("networking", 0.92), ("network administration", 0.88)],
    "ccna": [("networking", 0.95), ("network administration", 0.90), ("cisco", 0.82)],
    "ccnp": [("networking", 0.97), ("network administration", 0.95), ("ccna", 0.88), ("cisco", 0.85)],
    "tcp/ip": [("networking", 0.90), ("network protocols", 0.95), ("http", 0.72)],

}

# â”€â”€ Build canonical index â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def _build_index() -> Dict[str, List[Tuple[str, float]]]:
    """Return the ontology keyed by canonical skill names."""
    index: Dict[str, List[Tuple[str, float]]] = {}
    for raw_skill, implications in _RAW_IMPLIES.items():
        canon_skill = canonicalize_skill_name(raw_skill)
        canonical_implications = [
            (canonicalize_skill_name(impl_skill), conf)
            for impl_skill, conf in implications
        ]
        index[canon_skill] = canonical_implications
    return index


# Singleton canonical index
_ONTOLOGY: Dict[str, List[Tuple[str, float]]] = _build_index()


# â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@lru_cache(maxsize=4096)
def get_implication_confidence(student_skill: str, required_skill: str) -> float:
    """
    Return how much `student_skill` implies `required_skill`.

    Returns a float in [0, 1]:
      - 0.0  â†’ no implication
      - >0   â†’ student_skill implies required_skill at that confidence level

    Supports one level of transitive inference:
      React â†’ JavaScript (0.95)  +  JavaScript â†’ HTML (0.70)
      â†’ React implies HTML at  0.95 Ã— 0.70 Ã— TRANSITIVE_DECAY = 0.56
    """
    s_canon = canonicalize_skill_name(student_skill)
    r_canon = canonicalize_skill_name(required_skill)

    if s_canon == r_canon:
        return 1.0  # Trivial: same skill

    direct_implications = _ONTOLOGY.get(s_canon, [])

    # Direct lookup
    for implied_skill, confidence in direct_implications:
        if implied_skill == r_canon:
            return confidence

    # One-level transitive: s_canon â†’ intermediate â†’ r_canon
    best_transitive = 0.0
    for implied_skill, c1 in direct_implications:
        for implied2, c2 in _ONTOLOGY.get(implied_skill, []):
            if implied2 == r_canon:
                transitive_conf = c1 * c2 * TRANSITIVE_DECAY
                if transitive_conf > best_transitive:
                    best_transitive = transitive_conf

    return best_transitive


def expand_student_implied_skills(
    student_map: Dict[str, "StudentSkill"],  # type: ignore[name-defined]
) -> Dict[str, Tuple[float, str, int]]:
    """
    Expand a student's skill map with implied skills.

    Returns a dict: {canonical_implied_skill â†’ (max_confidence, source_skill_name, source_level)}

    This lets the scoring engine query: "can the student satisfy requirement R
    through any of their known skills, via implication?"
    """
    implied: Dict[str, Tuple[float, str, int]] = {}

    for canon_key, student_skill in student_map.items():
        for implied_skill, conf in _ONTOLOGY.get(canon_key, []):
            existing = implied.get(implied_skill)
            if existing is None or conf > existing[0]:
                implied[implied_skill] = (conf, student_skill.skill_name, student_skill.level)

        # Transitive (1 level)
        for implied_skill, c1 in _ONTOLOGY.get(canon_key, []):
            for implied2, c2 in _ONTOLOGY.get(implied_skill, []):
                trans_conf = c1 * c2 * TRANSITIVE_DECAY
                existing = implied.get(implied2)
                if existing is None or trans_conf > existing[0]:
                    implied[implied2] = (trans_conf, student_skill.skill_name, student_skill.level)

    return implied
