# Dockerfile (backend)
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Generate Prisma client for the target runtime
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/app.js"]