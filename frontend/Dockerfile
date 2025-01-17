FROM node:20-slim

WORKDIR /usr/src/app/frontend

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5173 (Vite's default port)
EXPOSE 5173