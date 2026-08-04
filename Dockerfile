FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM deps AS build
COPY tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs .prettierrc components.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/
COPY server/tsconfig.json ./server/
RUN npx prisma generate
COPY app/ ./app/
COPY components/ ./components/
COPY hooks/ ./hooks/
COPY lib/ ./lib/
COPY public/ ./public/
COPY server/ ./server/
RUN npm run build:api && npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/server/generated ./server/generated
COPY --from=build /app/dist ./dist
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/package.json ./package.json
EXPOSE 3000 4000
