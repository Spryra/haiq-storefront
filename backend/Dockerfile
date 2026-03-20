FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
USER nodeuser

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
