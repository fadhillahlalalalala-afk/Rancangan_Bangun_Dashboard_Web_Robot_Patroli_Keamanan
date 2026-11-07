# Dockerfile akhir (sesudah hardening) - sec-0.2
# Risiko: Risk-03, T04, T09 (non-root, permukaan serangan kecil, tanpa rahasia di image)
# Asumsi: ada package.json + package-lock.json, entrypoint src/app.js. Sesuaikan bila berbeda.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
# Pengguna non-root bawaan image node (uid 1000)
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
# Jangan menyalin .env, .git, atau rahasia apa pun (lihat .dockerignore)
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "src/app.js"]
