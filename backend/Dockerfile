FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

FROM node:24-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S vaultline -u 1001

WORKDIR /app

COPY --from=builder --chown=vaultline:nodejs /app/node_modules ./node_modules

COPY --chown=vaultline:nodejs . .

RUN rm -f .env

USER vaultline

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "src/server.js"]