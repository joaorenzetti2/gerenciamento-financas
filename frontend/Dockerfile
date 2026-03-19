# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Next.js app
# We pass the API URL as a build arg if needed, but for runtime it can be an env var
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy next.config.ts/js and package files
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the frontend port
EXPOSE 3001

# Start Next.js
# We use a custom port to avoid conflict with backend on host mode
CMD ["npm", "run", "start", "--", "-p", "3001"]
