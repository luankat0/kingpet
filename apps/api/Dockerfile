# ---------- build ----------
# Imagem com glibc: o bcrypt tem binário pronto para ela e não precisa compilar.
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Dependências de build do bcrypt, usadas só se não houver binário pronto.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Só os manifestos primeiro: o cache do npm ci sobrevive a mudanças no código.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN npm ci --workspace api --include-workspace-root

COPY apps/api apps/api

WORKDIR /app/apps/api

# URL fictícia: o prisma generate não conecta no banco, só precisa da variável.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Traz node_modules, dist, prisma e manifestos já prontos do estágio de build.
# O CLI do Prisma vem junto porque o container aplica as migrations ao subir.
COPY --from=build --chown=node:node /app /app

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

# Aplica as migrations pendentes e sobe a API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
