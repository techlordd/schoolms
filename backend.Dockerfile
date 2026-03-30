FROM node:18-bullseye

# Install OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first (better caching)
COPY backend/package*.json ./

# Clean install
RUN npm install --omit=dev

# Copy rest of app
COPY backend/ .

# Remove any cached Prisma engines (important fix)
RUN rm -rf node_modules/.prisma
RUN rm -rf /root/.cache/prisma

# Generate Prisma client correctly
RUN npx prisma generate

# Optional DB push
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN if [ -n "$DATABASE_URL" ]; then npx prisma db push --skip-generate; fi

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js || true && node src/app.js"]