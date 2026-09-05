# Sri Annamayya Cars — owner admin panel (Next.js 14, runs on port 4000)
# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* baked at build time. Set NEXT_PUBLIC_SITE_URL to the live site.
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_SITE_URL="https://sriannamayyacars.in"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# ---- run stage ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

# BACKEND_URL is read at runtime by next.config.mjs rewrites (set it in Coolify).
EXPOSE 4000
CMD ["npm", "run", "start"]
