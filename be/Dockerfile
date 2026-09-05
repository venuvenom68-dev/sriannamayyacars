# Sri Annamayya Cars — backend API (Node/Express, ESM)
FROM node:20-alpine

WORKDIR /app

# Install production deps only (jimp is pure-JS, no native build needed)
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY . .

ENV NODE_ENV=production
ENV PORT=5000

# Car photos live here — mount a Coolify persistent volume at /app/uploads
RUN mkdir -p /app/uploads
EXPOSE 5000

CMD ["node", "server.js"]
