FROM node:20-alpine
 
WORKDIR /usr/src/app/frontend/

COPY package*.json ./

# Install dependencies with legacy peer deps and include dev dependencies
RUN npm install --legacy-peer-deps --include=dev

COPY . .
RUN npm run build

ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000
