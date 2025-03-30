# Minecraft API

The Minecraft API provides endpoints for managing Minecraft server integration with challenges, including whitelist management, server IP revelation, player rewards, and in-game chat.

## Base URL

```
/api/v1/minecraft
```

## Endpoints

### Get Whitelist

Retrieves the whitelist for a specific challenge.

**Endpoint:** `GET /whitelist`

**Query Parameters:**
- `name` (required): The name of the challenge

**Validation:**
- `name` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "whitelist": [
      {
        "username": "string",
        "address": "string",
        "viral_balance": "number",
        "signature": "string"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: If the challenge is not found

### Reveal Server IP

Reveals the game server IP address to a verified user.

**Endpoint:** `POST /reveal`

**Request Body:**
```json
{
  "address": "string",
  "username": "string",
  "signature": "string",
  "challengeName": "string"
}
```

**Parameters:**
- `address` (required): The Solana wallet address of the user
- `username` (required): The Minecraft username
- `signature` (required): The signature proving ownership of the wallet
- `challengeName` (required): The name of the challenge

**Validation:**
- `address` must be a valid Solana wallet address
- `username` must be a string between 3 and 16 characters, containing only letters, numbers, and underscores
- `signature` must be a string with at least 10 characters
- `challengeName` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "game_ip": "string"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the challenge is not found
- `401 Unauthorized`: If the signature is invalid

**Notes:**
- The API verifies the signature against the provided wallet address
- The API retrieves the user's $VIRAL token balance
- The API updates the challenge's whitelist with the user's information
- The API sends a Discord webhook notification about the server IP reveal

### Reward Player

Rewards a player for winning a Minecraft challenge.

**Endpoint:** `POST /reward`

**Request Body:**
```json
{
  "username": "string",
  "secret": "string"
}
```

**Parameters:**
- `username` (required): The Minecraft username of the winner
- `secret` (required): The IPC secret for authentication

**Validation:**
- `username` must be a string between 3 and 16 characters, containing only letters, numbers, and underscores
- `secret` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: If the secret is invalid
- `404 Not Found`: If no active game tournament is found
- `404 Not Found`: If the winner is not found in the whitelist
- `404 Not Found`: If the tournament program info is not found

**Notes:**
- The API verifies the IPC secret
- The API finds the active tournament with a game property
- The API finds the winner's address from the whitelist
- The API concludes the tournament on-chain with the winner's address
- The API adds a victory message to the chat
- The API updates the challenge status to 'concluded'

### Save Chat Message

Saves a chat message from the Minecraft server.

**Endpoint:** `POST /chat`

**Request Body:**
```json
{
  "username": "string",
  "content": "string",
  "secret": "string"
}
```

**Parameters:**
- `username` (required): The Minecraft username of the sender
- `content` (required): The content of the chat message
- `secret` (required): The IPC secret for authentication

**Validation:**
- `username` must be a string between 3 and 16 characters, containing only letters, numbers, and underscores
- `content` must be a non-empty string
- `secret` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Chat message saved successfully"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: If the secret is invalid
- `404 Not Found`: If no active game challenge is found

**Notes:**
- The API verifies the IPC secret
- The API finds the active challenge with a game property
- The API creates a chat message with the appropriate role ('assistant' for viral_steve, 'player' for others)
