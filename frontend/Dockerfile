# --- STAGE 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package json
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build React ke folder dist
RUN npm run build

# --- STAGE 2: Serve (Production) ---
FROM node:18-alpine

WORKDIR /app

# Install simple web server
RUN npm install -g serve

# Copy hasil build (folder dist) dari Stage 1
COPY --from=builder /app/dist ./dist

# Expose port frontend
EXPOSE 3001

# Jalankan server
CMD ["serve", "-s", "dist", "-l", "3001"]