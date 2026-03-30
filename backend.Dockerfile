FROM node:20

# Force cache bust
ARG CACHEBUST=1

# Manually install OpenSSL (both 1.1.x and 3.x shared libraries)
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Install Prisma CLI globally as fallback
RUN npm install -g prisma

WORKDIR /app

# Copy backend source from repo root context
COPY backend/ .

# Install production dependencies (prisma CLI now in dependencies)
RUN npm install --omit=dev

# Generate Prisma client with correct engine binaries
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/app.js"]
