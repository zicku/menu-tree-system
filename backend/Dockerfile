# --- STAGE 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package json dulu (agar cache optimal)
COPY package*.json ./
RUN npm install

# Copy semua source code
COPY . .

# Build NestJS ke folder dist
RUN npm run build

# --- STAGE 2: Production Run ---
FROM node:18-alpine

WORKDIR /app

# Copy hasil build dari Stage 1
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port backend
EXPOSE 3000

# Command untuk menjalankan aplikasi
CMD ["npm", "run", "start:prod"]