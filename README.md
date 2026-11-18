# Sinerji — Tech Talent Ecosystem

An AI-powered platform that connects university students and junior developers with companies through real, paid tasks. Instead of screening CVs by hand, Sinerji matches people to work by their actual skills, verifies students automatically, and protects both sides with escrow payments.

[![CI](https://github.com/aaas72/Sinerji/actions/workflows/ci.yml/badge.svg)](https://github.com/aaas72/Sinerji/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white)

## Core Features

- **AI skill matching** — a hybrid score that combines exact requirement matching (hard score) with NLP semantic similarity (semantic score), so candidates are ranked by real fit
- **e-Devlet student verification** — a Puppeteer microservice verifies Turkish university student documents automatically through the e-Devlet portal
- **Escrow payments** — task budgets are locked with Iyzico when work is agreed and released only after the company approves the delivery
- **Real-time chat and notifications** — Socket.io keeps companies and students in sync throughout the task lifecycle
- **Automated lifecycle** — scheduled jobs cancel expired tasks and refund escrowed funds when deadlines pass without action
- **Reviews and badges** — mutual 5-star reviews and verifiable badges for completed work

## Architecture

```text
                    ┌────────────────────────────┐
                    │  Client — Next.js 16       │
                    └─────────────┬──────────────┘
                                  │ REST + WebSocket
                    ┌─────────────▼──────────────┐
                    │  Main API — Express + TS   │──▶ PostgreSQL (Prisma)
                    │  auth · tasks · chat · cron│
                    └──┬──────────┬───────────┬──┘
                       │          │           │
        ┌──────────────▼─┐ ┌──────▼───────┐ ┌─▼──────────────────┐
        │ AI Matching    │ │ Payment      │ │ Student            │
        │ FastAPI :8001  │ │ Iyzico :5001 │ │ Verification :4000 │
        └────────────────┘ └──────────────┘ └────────────────────┘
```

```text
Sinerji/
├── client/                         # Next.js 16, React 19, Tailwind CSS 4, Zod
├── server/                         # Express + TypeScript API (controllers, services, routes, middlewares)
├── services/
│   ├── ai-matching-service/        # Python / FastAPI hybrid matching engine
│   ├── payment-service/            # Iyzico escrow workflows
│   └── student-verification/       # Puppeteer e-Devlet document verification
├── tests/                          # End-to-end scenario and payment-flow scripts
├── Sinerji.wiki/                   # Project wiki
└── run_sinerji.ps1                 # Starts every component in one step (Windows)
```

The matching engine is also published as a standalone repository: **[sinerji-matching-microservice](https://github.com/aaas72/sinerji-matching-microservice)**.

## Getting Started

**Requirements:** Node.js 20+, Python 3.10+, PostgreSQL

### 1. Database and API

```bash
cd server
# .env → DATABASE_URL="postgresql://user:password@localhost:5432/sinerji_db?schema=public"
#        JWT_SECRET="your_secret"
npm install
npx prisma db push
npx prisma generate
npm run dev
```

### 2. Microservices

```bash
# AI matching (port 8001)
cd services/ai-matching-service
pip install -r requirements.txt
uvicorn main:app --port 8001

# Payments (port 5001)
cd services/payment-service && npm install && npm run dev

# Student verification (port 4000)
cd services/student-verification && npm install && npm run dev
```

Service-specific environment variables are documented in the project wiki.

### 3. Client

```bash
cd client
npm install
npm run dev      # http://localhost:3000
```

On Windows, `./run_sinerji.ps1` starts the API, client and all microservices in separate terminals.

## Testing

```bash
cd server && npm test                                   # Vitest: validation, JWT, auth and error middleware
cd services/ai-matching-service && python -m pytest     # pytest: hard filter, ontology, scoring, explanations
```

Every push and pull request runs these suites, plus type-checking and builds for the server and client, in [GitHub Actions](.github/workflows/ci.yml).

## Author

**Abdellah Sheikh** — [abdellahsheikh.dev](https://abdellahsheikh.dev) · [LinkedIn](https://www.linkedin.com/in/abdellahsheikh)
