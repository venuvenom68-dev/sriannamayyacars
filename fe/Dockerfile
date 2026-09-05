# Sri Annamayya Cars — public website (Next.js 14)
# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are baked into the browser bundle at build time.
# (API stays same-origin/blank — it's proxied to the backend by next.config.mjs.)
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_PHONE=919441775216
ARG NEXT_PUBLIC_PHONE_DISPLAY="94417 75216"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PHONE=$NEXT_PUBLIC_PHONE
ENV NEXT_PUBLIC_PHONE_DISPLAY=$NEXT_PUBLIC_PHONE_DISPLAY

RUN npm run build

# ---- run stage ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

# BACKEND_URL is read at runtime by next.config.mjs rewrites (set it in Coolify).
EXPOSE 3000
CMD ["npm", "run", "start"]
