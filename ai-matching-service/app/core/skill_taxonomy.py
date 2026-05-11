"""
Sinerji Local Skill Taxonomy
─────────────────────────────
A comprehensive, multi-domain skill ontology inspired by the ESCO
(European Skills/Competences, qualifications and Occupations) standard.

Each key is a canonical skill name (lowercase).
Each value is a list of parent/related categories the skill belongs to.

Coverage: ~400 skills · ~1 500 relationships · 10 domains
"""

SKILL_TAXONOMY = {
    # ══════════════════════════════════════════════════════════════════
    # 1. PROGRAMMING LANGUAGES
    # ══════════════════════════════════════════════════════════════════
    "javascript": ["programming", "web development", "frontend", "backend"],
    "typescript": ["javascript", "programming", "web development"],
    "python": ["programming", "data science", "backend", "machine learning"],
    "java": ["programming", "backend", "mobile development", "enterprise"],
    "c#": ["programming", "backend", ".net", "game development"],
    "c++": ["programming", "systems programming", "game development"],
    "c": ["programming", "systems programming", "embedded systems"],
    "go": ["programming", "backend", "cloud computing"],
    "rust": ["programming", "systems programming", "web assembly"],
    "ruby": ["programming", "backend", "web development"],
    "php": ["programming", "backend", "web development"],
    "swift": ["programming", "mobile development", "ios"],
    "kotlin": ["programming", "mobile development", "android", "java"],
    "dart": ["programming", "mobile development", "flutter"],
    "r": ["programming", "data science", "statistics"],
    "scala": ["programming", "java", "big data"],
    "lua": ["programming", "scripting", "game development"],
    "matlab": ["programming", "engineering", "data science", "mathematics"],
    "sql": ["programming", "database", "data management"],
    "html": ["web development", "frontend", "markup"],
    "css": ["web development", "frontend", "styling", "design"],
    "sass": ["css", "frontend", "web development"],
    "less": ["css", "frontend", "web development"],

    # ══════════════════════════════════════════════════════════════════
    # 2. FRONTEND FRAMEWORKS & LIBRARIES
    # ══════════════════════════════════════════════════════════════════
    "react": ["javascript", "frontend", "web development", "ui development"],
    "react native": ["react", "javascript", "mobile development", "cross-platform"],
    "next.js": ["react", "javascript", "fullstack", "web development"],
    "gatsby": ["react", "javascript", "frontend", "static site"],
    "angular": ["typescript", "frontend", "web development"],
    "vue.js": ["javascript", "frontend", "web development"],
    "nuxt.js": ["vue.js", "javascript", "fullstack"],
    "svelte": ["javascript", "frontend", "web development"],
    "jquery": ["javascript", "frontend", "web development"],
    "bootstrap": ["css", "frontend", "ui development", "responsive design"],
    "tailwindcss": ["css", "frontend", "ui development"],
    "material ui": ["react", "frontend", "ui development", "design system"],
    "chakra ui": ["react", "frontend", "ui development"],
    "shadcn": ["react", "frontend", "ui development", "tailwindcss"],

    # ══════════════════════════════════════════════════════════════════
    # 3. BACKEND FRAMEWORKS
    # ══════════════════════════════════════════════════════════════════
    "node.js": ["javascript", "backend", "web development", "server-side"],
    "express": ["node.js", "javascript", "backend"],
    "express.js": ["node.js", "javascript", "backend"],
    "nestjs": ["node.js", "typescript", "backend", "enterprise"],
    "fastify": ["node.js", "javascript", "backend"],
    "django": ["python", "backend", "web development", "fullstack"],
    "flask": ["python", "backend", "web development"],
    "fastapi": ["python", "backend", "api development"],
    "spring": ["java", "backend", "enterprise"],
    "spring boot": ["java", "spring", "backend", "microservices"],
    "rails": ["ruby", "backend", "web development", "fullstack"],
    "ruby on rails": ["ruby", "backend", "web development"],
    "laravel": ["php", "backend", "web development"],
    "asp.net": ["c#", ".net", "backend"],
    ".net": ["c#", "backend", "enterprise"],
    "gin": ["go", "backend", "web development"],

    # ══════════════════════════════════════════════════════════════════
    # 4. DATABASES & ORM
    # ══════════════════════════════════════════════════════════════════
    "postgresql": ["database", "sql", "relational database"],
    "mysql": ["database", "sql", "relational database"],
    "mariadb": ["mysql", "database", "sql"],
    "sqlite": ["database", "sql", "relational database"],
    "mongodb": ["database", "nosql", "document database"],
    "redis": ["database", "nosql", "caching", "in-memory database"],
    "elasticsearch": ["database", "nosql", "search engine", "big data"],
    "cassandra": ["database", "nosql", "distributed systems"],
    "dynamodb": ["database", "nosql", "aws"],
    "firebase": ["database", "nosql", "google cloud", "mobile development"],
    "supabase": ["database", "postgresql", "backend"],
    "neo4j": ["database", "nosql", "graph database"],
    "oracle": ["database", "sql", "enterprise"],
    "sql server": ["database", "sql", "microsoft"],
    "prisma": ["database", "orm", "node.js", "typescript"],
    "sequelize": ["database", "orm", "node.js"],
    "typeorm": ["database", "orm", "typescript"],
    "sqlalchemy": ["database", "orm", "python"],
    "mongoose": ["database", "orm", "mongodb", "node.js"],

    # ══════════════════════════════════════════════════════════════════
    # 5. DEVOPS & CLOUD
    # ══════════════════════════════════════════════════════════════════
    "docker": ["devops", "containerization", "cloud computing"],
    "kubernetes": ["docker", "devops", "container orchestration"],
    "aws": ["cloud computing", "infrastructure", "devops"],
    "amazon web services": ["cloud computing", "infrastructure", "devops"],
    "azure": ["cloud computing", "microsoft", "infrastructure"],
    "google cloud": ["cloud computing", "infrastructure", "devops"],
    "gcp": ["google cloud", "cloud computing"],
    "heroku": ["cloud computing", "deployment", "paas"],
    "vercel": ["cloud computing", "deployment", "frontend"],
    "netlify": ["cloud computing", "deployment", "frontend"],
    "digitalocean": ["cloud computing", "infrastructure"],
    "terraform": ["devops", "infrastructure as code"],
    "ansible": ["devops", "automation", "configuration management"],
    "jenkins": ["devops", "ci/cd", "automation"],
    "github actions": ["devops", "ci/cd", "github"],
    "gitlab ci": ["devops", "ci/cd", "gitlab"],
    "nginx": ["devops", "web server", "backend"],
    "apache": ["devops", "web server", "backend"],
    "linux": ["operating system", "devops", "systems administration"],
    "ubuntu": ["linux", "operating system"],
    "bash": ["linux", "scripting", "devops"],
    "powershell": ["scripting", "windows", "devops"],
    "ci/cd": ["devops", "automation", "software engineering"],
    "git": ["version control", "devops", "software engineering"],
    "github": ["git", "version control", "collaboration"],
    "gitlab": ["git", "version control", "devops"],

    # ══════════════════════════════════════════════════════════════════
    # 6. MOBILE DEVELOPMENT
    # ══════════════════════════════════════════════════════════════════
    "flutter": ["dart", "mobile development", "cross-platform"],
    "ios": ["mobile development", "swift", "apple"],
    "android": ["mobile development", "java", "kotlin"],
    "xamarin": ["c#", "mobile development", "cross-platform"],
    "ionic": ["javascript", "mobile development", "cross-platform"],
    "swiftui": ["swift", "ios", "ui development"],
    "jetpack compose": ["kotlin", "android", "ui development"],

    # ══════════════════════════════════════════════════════════════════
    # 7. TESTING
    # ══════════════════════════════════════════════════════════════════
    "jest": ["javascript", "testing", "unit testing"],
    "mocha": ["javascript", "testing", "unit testing"],
    "cypress": ["javascript", "testing", "e2e testing"],
    "playwright": ["testing", "e2e testing", "automation"],
    "selenium": ["testing", "e2e testing", "automation"],
    "pytest": ["python", "testing", "unit testing"],
    "junit": ["java", "testing", "unit testing"],
    "vitest": ["javascript", "testing", "unit testing"],
    "storybook": ["frontend", "testing", "ui development"],

    # ══════════════════════════════════════════════════════════════════
    # 8. API & COMMUNICATION
    # ══════════════════════════════════════════════════════════════════
    "rest api": ["api development", "web development", "backend"],
    "graphql": ["api development", "web development", "backend"],
    "grpc": ["api development", "backend", "microservices"],
    "websocket": ["api development", "real-time", "backend"],
    "socket.io": ["websocket", "node.js", "real-time"],
    "swagger": ["api development", "documentation"],
    "postman": ["api development", "testing"],

    # ══════════════════════════════════════════════════════════════════
    # 9. DATA SCIENCE & AI / ML
    # ══════════════════════════════════════════════════════════════════
    "machine learning": ["artificial intelligence", "data science", "mathematics"],
    "deep learning": ["machine learning", "artificial intelligence"],
    "natural language processing": ["machine learning", "artificial intelligence"],
    "nlp": ["natural language processing", "machine learning"],
    "computer vision": ["machine learning", "artificial intelligence"],
    "tensorflow": ["machine learning", "deep learning", "python"],
    "pytorch": ["machine learning", "deep learning", "python"],
    "keras": ["deep learning", "tensorflow", "python"],
    "scikit-learn": ["machine learning", "python", "data science"],
    "pandas": ["python", "data science", "data analysis"],
    "numpy": ["python", "data science", "mathematics"],
    "scipy": ["python", "scientific computing", "mathematics"],
    "matplotlib": ["python", "data visualization"],
    "seaborn": ["python", "data visualization", "matplotlib"],
    "plotly": ["data visualization", "python", "javascript"],
    "jupyter": ["python", "data science", "interactive computing"],
    "opencv": ["computer vision", "python", "c++"],
    "hugging face": ["nlp", "machine learning", "transformers"],
    "langchain": ["artificial intelligence", "llm", "python"],
    "data mining": ["data science", "machine learning", "statistics"],
    "big data": ["data science", "data engineering"],
    "hadoop": ["big data", "java", "distributed systems"],
    "spark": ["big data", "data engineering", "machine learning"],
    "apache kafka": ["big data", "streaming", "distributed systems"],
    "airflow": ["data engineering", "python", "workflow orchestration"],
    "data analysis": ["data science", "statistics", "business intelligence"],
    "data visualization": ["data science", "data analysis"],
    "power bi": ["data visualization", "business intelligence", "microsoft"],
    "tableau": ["data visualization", "business intelligence"],
    "looker": ["data visualization", "business intelligence"],
    "excel": ["data analysis", "spreadsheet", "microsoft", "business"],
    "google sheets": ["data analysis", "spreadsheet", "google"],
    "statistics": ["mathematics", "data science", "research"],

    # ══════════════════════════════════════════════════════════════════
    # 10. DESIGN
    # ══════════════════════════════════════════════════════════════════
    "ui design": ["design", "user experience", "visual design"],
    "ux design": ["design", "user experience", "user research"],
    "ui/ux": ["ui design", "ux design", "design"],
    "graphic design": ["design", "visual design", "creative"],
    "web design": ["design", "frontend", "ui design"],
    "figma": ["ui design", "design", "prototyping"],
    "sketch": ["ui design", "design", "prototyping"],
    "adobe xd": ["ui design", "design", "prototyping"],
    "photoshop": ["graphic design", "design", "image editing", "adobe"],
    "adobe photoshop": ["graphic design", "design", "image editing"],
    "illustrator": ["graphic design", "design", "vector graphics", "adobe"],
    "adobe illustrator": ["graphic design", "design", "vector graphics"],
    "indesign": ["graphic design", "design", "print design", "adobe"],
    "after effects": ["motion graphics", "animation", "video editing", "adobe"],
    "premiere pro": ["video editing", "media production", "adobe"],
    "canva": ["graphic design", "design", "visual content"],
    "blender": ["3d modeling", "animation", "design", "game development"],
    "maya": ["3d modeling", "animation", "design"],
    "3ds max": ["3d modeling", "animation", "design"],
    "cinema 4d": ["3d modeling", "animation", "motion graphics"],
    "wireframing": ["ui design", "ux design", "prototyping"],
    "prototyping": ["ui design", "ux design", "design"],
    "responsive design": ["web design", "frontend", "css"],
    "design system": ["ui design", "design", "frontend"],
    "branding": ["design", "marketing", "graphic design"],
    "logo design": ["graphic design", "branding", "design"],
    "illustration": ["graphic design", "design", "creative"],
    "animation": ["design", "motion graphics", "creative"],
    "interaction design": ["ui design", "ux design", "design"],
    "user research": ["ux design", "research", "design"],
    "design thinking": ["ux design", "innovation", "problem solving"],
    "accessibility": ["web design", "ux design", "frontend"],

    # ══════════════════════════════════════════════════════════════════
    # 11. MARKETING
    # ══════════════════════════════════════════════════════════════════
    "digital marketing": ["marketing", "business", "online"],
    "seo": ["digital marketing", "marketing", "content"],
    "search engine optimization": ["seo", "digital marketing"],
    "sem": ["digital marketing", "marketing", "advertising"],
    "google ads": ["sem", "advertising", "digital marketing"],
    "facebook ads": ["advertising", "social media marketing"],
    "social media marketing": ["digital marketing", "marketing", "content creation"],
    "content marketing": ["digital marketing", "marketing", "writing"],
    "email marketing": ["digital marketing", "marketing", "communication"],
    "affiliate marketing": ["digital marketing", "marketing", "e-commerce"],
    "influencer marketing": ["social media marketing", "marketing"],
    "marketing analytics": ["marketing", "data analysis"],
    "google analytics": ["marketing analytics", "data analysis", "seo"],
    "market research": ["marketing", "research", "business"],
    "brand management": ["marketing", "branding", "business"],
    "public relations": ["marketing", "communication", "media"],
    "copywriting": ["content creation", "writing", "marketing"],
    "content creation": ["marketing", "creative", "writing"],
    "growth hacking": ["marketing", "startup", "digital marketing"],
    "conversion optimization": ["digital marketing", "ux design"],
    "a/b testing": ["conversion optimization", "data analysis"],
    "crm": ["marketing", "sales", "business"],
    "hubspot": ["crm", "marketing", "sales"],
    "salesforce": ["crm", "sales", "business", "enterprise"],
    "mailchimp": ["email marketing", "marketing", "automation"],

    # ══════════════════════════════════════════════════════════════════
    # 12. BUSINESS & MANAGEMENT
    # ══════════════════════════════════════════════════════════════════
    "project management": ["management", "business", "leadership"],
    "agile": ["project management", "software engineering"],
    "scrum": ["agile", "project management"],
    "kanban": ["agile", "project management"],
    "jira": ["project management", "agile", "atlassian"],
    "trello": ["project management", "kanban", "collaboration"],
    "asana": ["project management", "collaboration"],
    "product management": ["management", "business", "strategy"],
    "business analysis": ["business", "data analysis", "strategy"],
    "financial analysis": ["business", "finance", "data analysis"],
    "accounting": ["finance", "business", "mathematics"],
    "bookkeeping": ["accounting", "finance"],
    "budgeting": ["finance", "business", "planning"],
    "financial modeling": ["finance", "data analysis", "excel"],
    "investment analysis": ["finance", "business"],
    "risk management": ["business", "finance", "strategy"],
    "supply chain management": ["business", "logistics", "operations"],
    "operations management": ["business", "management"],
    "human resources": ["business", "management"],
    "recruitment": ["human resources", "business"],
    "strategic planning": ["business", "management", "leadership"],
    "business development": ["business", "sales", "strategy"],
    "entrepreneurship": ["business", "startup", "leadership"],
    "e-commerce": ["business", "web development", "digital marketing"],
    "consulting": ["business", "strategy", "analysis"],
    "negotiation": ["business", "communication", "soft skills"],
    "presentation": ["communication", "business", "soft skills"],
    "microsoft office": ["business", "productivity"],
    "notion": ["productivity", "collaboration", "project management"],

    # ══════════════════════════════════════════════════════════════════
    # 13. ENGINEERING
    # ══════════════════════════════════════════════════════════════════
    "autocad": ["engineering", "design", "cad"],
    "solidworks": ["engineering", "mechanical engineering", "3d modeling"],
    "catia": ["engineering", "mechanical engineering", "3d modeling"],
    "revit": ["engineering", "architecture", "bim"],
    "mechanical engineering": ["engineering", "physics", "mathematics"],
    "electrical engineering": ["engineering", "electronics", "physics"],
    "civil engineering": ["engineering", "construction", "infrastructure"],
    "chemical engineering": ["engineering", "chemistry"],
    "industrial engineering": ["engineering", "operations", "optimization"],
    "robotics": ["engineering", "programming", "artificial intelligence"],
    "embedded systems": ["engineering", "programming", "electronics", "c"],
    "arduino": ["embedded systems", "electronics", "programming"],
    "raspberry pi": ["embedded systems", "linux", "programming"],
    "iot": ["embedded systems", "networking", "cloud computing"],
    "internet of things": ["iot", "embedded systems"],
    "pcb design": ["electrical engineering", "electronics"],
    "control systems": ["engineering", "automation", "mathematics"],
    "plc": ["automation", "industrial engineering"],
    "simulink": ["matlab", "engineering", "simulation"],
    "ansys": ["engineering", "simulation"],

    # ══════════════════════════════════════════════════════════════════
    # 14. CYBERSECURITY & NETWORKING
    # ══════════════════════════════════════════════════════════════════
    "cybersecurity": ["security", "networking", "it"],
    "network security": ["cybersecurity", "networking"],
    "penetration testing": ["cybersecurity", "security"],
    "ethical hacking": ["cybersecurity", "security"],
    "cryptography": ["cybersecurity", "mathematics"],
    "networking": ["it", "infrastructure"],
    "tcp/ip": ["networking", "protocols"],
    "vpn": ["networking", "security"],
    "windows server": ["systems administration", "microsoft"],
    "vmware": ["virtualization", "cloud computing"],
    "it support": ["it", "troubleshooting"],

    # ══════════════════════════════════════════════════════════════════
    # 15. MEDIA & CONTENT PRODUCTION
    # ══════════════════════════════════════════════════════════════════
    "video editing": ["media production", "creative", "content creation"],
    "video production": ["media production", "creative"],
    "photography": ["creative", "visual art", "media"],
    "photo editing": ["photography", "graphic design"],
    "lightroom": ["photo editing", "photography", "adobe"],
    "davinci resolve": ["video editing", "color grading"],
    "final cut pro": ["video editing", "media production"],
    "audio editing": ["media production", "sound design"],
    "podcast production": ["audio editing", "content creation"],
    "obs studio": ["streaming", "video production"],
    "wordpress": ["web development", "content management"],
    "shopify": ["e-commerce", "web development"],
    "woocommerce": ["wordpress", "e-commerce"],
    "webflow": ["web design", "no-code", "frontend"],
    "technical writing": ["writing", "documentation"],
    "creative writing": ["writing", "creative"],
    "journalism": ["writing", "media", "communication"],
    "translation": ["languages", "communication"],

    # ══════════════════════════════════════════════════════════════════
    # 16. BLOCKCHAIN & WEB3
    # ══════════════════════════════════════════════════════════════════
    "blockchain": ["distributed systems", "cryptography", "web3"],
    "solidity": ["blockchain", "programming", "ethereum"],
    "ethereum": ["blockchain", "cryptocurrency"],
    "smart contracts": ["blockchain", "programming"],
    "web3": ["blockchain", "decentralized", "javascript"],

    # ══════════════════════════════════════════════════════════════════
    # 17. GAME DEVELOPMENT
    # ══════════════════════════════════════════════════════════════════
    "game development": ["programming", "creative", "design"],
    "unity": ["game development", "c#", "3d"],
    "unreal engine": ["game development", "c++", "3d"],
    "godot": ["game development", "programming"],
    "game design": ["game development", "design", "creative"],

    # ══════════════════════════════════════════════════════════════════
    # 18. LANGUAGES
    # ══════════════════════════════════════════════════════════════════
    "english": ["languages", "communication", "international"],
    "arabic": ["languages", "communication"],
    "turkish": ["languages", "communication"],
    "german": ["languages", "communication", "european"],
    "french": ["languages", "communication", "european"],
    "spanish": ["languages", "communication"],
    "chinese": ["languages", "communication"],
    "japanese": ["languages", "communication"],
    "korean": ["languages", "communication"],
    "russian": ["languages", "communication"],
    "italian": ["languages", "communication"],
    "hindi": ["languages", "communication"],

    # ══════════════════════════════════════════════════════════════════
    # 19. SOFT SKILLS
    # ══════════════════════════════════════════════════════════════════
    "leadership": ["soft skills", "management", "teamwork"],
    "communication": ["soft skills", "interpersonal"],
    "teamwork": ["soft skills", "collaboration"],
    "problem solving": ["soft skills", "analytical thinking"],
    "critical thinking": ["soft skills", "analytical thinking"],
    "analytical thinking": ["soft skills", "problem solving"],
    "creativity": ["soft skills", "innovation", "design thinking"],
    "time management": ["soft skills", "productivity"],
    "adaptability": ["soft skills", "flexibility"],
    "attention to detail": ["soft skills", "quality"],
    "emotional intelligence": ["soft skills", "interpersonal"],
    "conflict resolution": ["soft skills", "communication"],
    "decision making": ["soft skills", "leadership"],
    "public speaking": ["communication", "presentation"],
    "customer service": ["communication", "business"],
    "work ethic": ["soft skills", "professionalism"],
    "self motivation": ["soft skills", "productivity"],
    "organization": ["soft skills", "productivity"],
    "research": ["analytical thinking", "academic"],
    "teaching": ["communication", "education"],
    "mentoring": ["leadership", "teaching"],
    "coaching": ["leadership", "mentoring"],

    # ══════════════════════════════════════════════════════════════════
    # 20. SCIENCES & EDUCATION
    # ══════════════════════════════════════════════════════════════════
    "scientific research": ["research", "academic"],
    "laboratory skills": ["sciences", "research"],
    "biology": ["sciences", "research"],
    "chemistry": ["sciences", "research"],
    "physics": ["sciences", "mathematics", "engineering"],
    "environmental science": ["sciences", "sustainability"],
    "biotechnology": ["biology", "technology"],
    "bioinformatics": ["biology", "data science", "programming"],
    "clinical research": ["research", "healthcare"],
    "nursing": ["healthcare", "patient care"],
    "curriculum development": ["education", "teaching"],
    "instructional design": ["education", "e-learning"],
    "e-learning": ["education", "technology"],
    "tutoring": ["teaching", "education"],

    # ══════════════════════════════════════════════════════════════════
    # 21. LEGAL & ARCHITECTURE
    # ══════════════════════════════════════════════════════════════════
    "legal research": ["legal", "research"],
    "contract law": ["legal", "business"],
    "intellectual property": ["legal", "business"],
    "architecture": ["design", "engineering", "construction"],
    "interior design": ["design", "architecture"],
    "landscape design": ["design", "architecture"],
    "urban planning": ["architecture", "civil engineering"],
    "sketchup": ["architecture", "3d modeling"],
}
