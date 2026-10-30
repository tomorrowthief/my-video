# Build with repository root as context: docker build -f cloudflare/Dockerfile .
FROM node:22.22.3-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22.22.3-bookworm-slim AS renderer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium ffmpeg fonts-noto-cjk ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src/studio ./src/studio
COPY --chown=node:node server ./server
ENV NODE_ENV=production STUDIO_HOST=0.0.0.0 STUDIO_PORT=3401 \
    STUDIO_BROWSER_EXECUTABLE=/usr/bin/chromium STUDIO_DATA_DIR=/tmp/studio \
    STUDIO_ALLOWED_HOSTS=localhost,127.0.0.1,renderer.internal
USER node
EXPOSE 3401
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:3401/api/studio/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "--experimental-strip-types", "server/index.mjs"]
