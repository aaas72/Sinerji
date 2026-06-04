# Sinerji — Student Verification Microservice

> A standalone, stateless, KVKK-compliant microservice that verifies Turkish university student documents (YÖK Öğrenci Belgesi) via the [e-Devlet Belge Doğrulama](https://www.turkiye.gov.tr/belge-dogrulama) portal.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Sinerji Platform                      │
│                                                         │
│  ┌──────────┐     POST /api/verify-student     ┌──────────────────┐
│  │  Main    │ ──────────────────────────────▶  │  Student         │
│  │  Server  │ ◀──────────────────────────────  │  Verification    │
│  │ (NestJS) │       JSON Response              │  µService        │
│  └──────────┘                                  │  (This service)  │
│                                                │                  │
│                                                │  ┌────────────┐  │
│                                                │  │ Puppeteer  │  │
│                                                │  │ (Headless) │──┼──▶ e-Devlet
│                                                │  └────────────┘  │
│                                                └──────────────────┘
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd services/student-verification
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set a strong SINERJI_MICROSERVICE_SECRET
```

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run Locally

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

### 4. Test the Health Check

```bash
curl http://localhost:4000/health
```

## API Reference

### `POST /api/verify-student`

Verifies a YÖK Öğrenci Belgesi PDF document.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | Your `SINERJI_MICROSERVICE_SECRET` | ✅ |
| `Content-Type` | `multipart/form-data` | ✅ |

**Body:**
| Field | Type | Description |
|-------|------|-------------|
| `document` | File (PDF) | The e-Devlet Öğrenci Belgesi PDF (max 5 MB) |

**Success Response (200):**
```json
{
  "success": true,
  "studentName": "Ali Yılmaz",
  "university": "İstanbul Teknik Üniversitesi",
  "program": "Bilgisayar Mühendisliği",
  "status": "AKTİF ÖĞRENCİ",
  "message": "Document successfully verified via e-Devlet.",
  "meta": {
    "processedInMs": 3200
  }
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 400 | Missing file or invalid file type |
| 401 | Missing `x-api-key` header |
| 403 | Invalid API key |
| 413 | File exceeds 5 MB limit |
| 422 | PDF parsing failed or credentials not found |
| 429 | Rate limit exceeded (max 10 req/min) |
| 500 | Internal server error |

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/verify-student \
  -H "x-api-key: YOUR_SECRET_KEY" \
  -F "document=@/path/to/ogrenci-belgesi.pdf"
```

### `GET /health`

Returns service health status. No authentication required.

```json
{
  "status": "healthy",
  "service": "sinerji-student-verification",
  "uptime": 3600,
  "timestamp": "2026-06-04T15:00:00.000Z"
}
```

## Docker Deployment

### Build & Run

```bash
docker build -t sinerji-student-verification .
docker run -p 4000:4000 --env-file .env sinerji-student-verification
```

### Deploy on Render

1. Create a **New Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `services/student-verification`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/server.js`
5. Add environment variables:
   - `SINERJI_MICROSERVICE_SECRET` = your secret key
   - `NODE_ENV` = `production`
   - `PUPPETEER_EXECUTABLE_PATH` = `/usr/bin/chromium` (if using Docker)
6. Under **Advanced** → select **Docker** runtime if using the Dockerfile

> **Note:** On Render's free tier, add a Puppeteer buildpack or use the Docker deployment method for Chromium support.

## KVKK Compliance

This microservice is designed as a **Black Box** with zero data persistence:

| Principle | Implementation |
|-----------|---------------|
| **No Disk I/O** | PDF files are handled entirely in memory via `multer.memoryStorage()` |
| **No Database** | Zero database connections; fully stateless |
| **PII Lifetime** | T.C. Kimlik and Barkod exist only during the request cycle |
| **PII Destruction** | All PII variables are explicitly set to `null` in a `finally` block |
| **No PII Logging** | Logger never outputs personal data |
| **Ephemeral Browser** | Puppeteer browser is launched fresh per request and destroyed after |
| **Transport Security** | HTTPS enforced in production via reverse proxy |

## File Structure

```
services/student-verification/
├── Dockerfile              # Production Docker image with Chromium
├── .dockerignore           # Docker build exclusions
├── .env.example            # Environment variable template
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── src/
    ├── server.js           # Express entry point
    ├── config/
    │   └── index.js        # Centralized env config with validation
    ├── middleware/
    │   └── auth.middleware.js  # API key gate (constant-time comparison)
    ├── routes/
    │   └── verify.routes.js   # Route definitions + multer setup
    ├── controllers/
    │   └── verify.controller.js  # Request orchestrator + PII cleanup
    ├── services/
    │   ├── pdf.service.js     # PDF text extraction (in-memory)
    │   └── scraper.service.js # Puppeteer e-Devlet scraping
    └── utils/
        └── logger.js         # KVKK-safe structured logger
```
