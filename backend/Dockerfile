# Dockerfile (backend)
FROM node:20-alpine

WORKDIR /app

# Copy source
COPY . .

# Install dependencies
RUN npm install --omit=dev

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/app.js"]
