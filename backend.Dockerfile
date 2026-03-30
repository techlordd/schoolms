FROM node:20-slim

WORKDIR /app

# Copy backend source from repo root context
COPY backend/ .

# Install dependencies
RUN npm install --omit=dev

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/app.js"]
