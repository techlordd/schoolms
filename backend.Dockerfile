FROM node:20

WORKDIR /app

# Copy backend source from repo root context
COPY backend/ .

# Install all dependencies including dev (prisma CLI is in devDependencies)
RUN npm install

# Generate Prisma client with correct engine binaries
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/app.js"]
