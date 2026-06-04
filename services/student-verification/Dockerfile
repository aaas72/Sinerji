# ============================================================
# Sinerji Student Verification Microservice — Dockerfile
# ============================================================
# Multi-stage build optimized for Puppeteer in production.
# Uses system Chromium instead of bundled one to reduce image size.
#
# Build:  docker build -t sinerji-student-verification .
# Run:    docker run -p 4000:4000 --env-file .env sinerji-student-verification
# ============================================================

# ── Stage 1: Build ──
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Production ──
FROM node:20-slim

# Install Chromium and its dependencies for Puppeteer
# These are the minimal packages required to run headless Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip downloading Chromium and use the system one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create a non-root user for security
RUN groupadd -r sinerji && useradd -r -g sinerji -G audio,video sinerji \
    && mkdir -p /home/sinerji/Downloads /app \
    && chown -R sinerji:sinerji /home/sinerji /app

WORKDIR /app

# Copy built node_modules from builder stage
COPY --from=builder --chown=sinerji:sinerji /app/node_modules ./node_modules

# Copy application source code
COPY --chown=sinerji:sinerji . .

# Switch to non-root user
USER sinerji

# Expose the service port
EXPOSE 4000

# Health check for container orchestrators (Docker Compose, Kubernetes, etc.)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1));"

# Start the microservice
CMD ["node", "src/server.js"]
