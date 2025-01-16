FROM node:20-slim

WORKDIR /usr/src/app/svelte-frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy the rest of the application
COPY . .

# Expose port 5173 (Vite's default port)
EXPOSE 5173

# Command is specified in docker-compose.dev.yml
