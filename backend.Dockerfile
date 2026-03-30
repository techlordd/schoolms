FROM node:18-bullseye

# Install OpenSSL 1.1.x
RUN apt-get update -y && \
    apt-get install -y openssl libssl1.1 libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Prisma CLI globally
RUN npm install -g prisma

WORKDIR /app

# Copy backend source from repo root context
COPY backend/ .

# Install production dependencies
RUN npm install --omit=dev

# Generate Prisma client with correct engine binaries
RUN npx prisma generate

# Push schema to database at build time (OpenSSL available here)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN if [ -n "$DATABASE_URL" ]; then npx prisma db push --skip-generate; else echo "No DATABASE_URL — skipping prisma db push"; fi

EXPOSE 5000

CMD ["sh", "-c", "node prisma/seed.js && node src/app.js"]
