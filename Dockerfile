##### DEPENDENCIES

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl g++ make python3
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN \
    if [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
    else echo "PNPM lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn global add pnpm && SKIP_ENV_VALIDATION=1 IS_BUILDING=1 pnpm run build;
RUN node scripts/build.mjs;

##### RUNNER

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/scripts-dist ./scripts-dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle


EXPOSE 3000
ENV PORT 3000

CMD ["server.js"]