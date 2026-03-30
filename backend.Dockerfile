FROM node:18-bullseye

# Install OpenSSL 1.1.x (matches Railway runtime environment)
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

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/app.js"]
