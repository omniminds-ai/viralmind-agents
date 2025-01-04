FROM node:21.4.0-bookworm

WORKDIR /usr/src/app/backend/

COPY package*.json ./
COPY jailbreak-pool/Anchor.toml ./
COPY jailbreak-pool/target ./target

RUN apt update \
    && apt install --assume-yes --no-install-recommends \
    build-essential \
    python3
RUN npm ci --include=dev

COPY . .

EXPOSE 8001
