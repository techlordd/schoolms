FROM node:20

# Force cache bust
ARG CACHEBUST=1

WORKDIR /app

# Copy backend source from repo root context
COPY backend/ .

# Install production dependencies (prisma CLI now in dependencies)
RUN npm install --omit=dev

# Generate Prisma client with correct engine binaries
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/app.js"]
