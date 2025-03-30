# Minecraft API

## Overview

The Minecraft API provides endpoints for managing Minecraft server access, player whitelisting, in-game rewards, and chat integration for blockchain-based tournaments.

## Base Path

```
/api/minecraft
```

## Endpoints

### GET /whitelist

Retrieves the whitelist for a specific challenge.

#### Query Parameters

- `name` (required): The name of the challenge

#### Response

- `whitelist`: Array of whitelisted players with their usernames, addresses, and token balances

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Missing challenge name
- `404 Not Found`: Challenge not found
- `500 Internal Server Error`: Internal server error

### POST /reveal

Reveals the game server IP address to a verified player and adds them to the whitelist.

#### Request Body

- `address` (required): The wallet address of the player
- `username` (required): The Minecraft username
- `signature` (required): Base64-encoded signature of the username signed by the wallet
- `challengeName` (required): The name of the challenge

#### Response

- `success`: Boolean indicating success
- `game_ip`: The IP address of the game server

#### Authentication

Authentication is handled through signature verification:
- The signature must be a valid signature of the username
- The signature must be created by the provided wallet address

#### Error Responses

- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid signature
- `404 Not Found`: Challenge not found
- `500 Internal Server Error`: Internal server error

#### Processing Details

1. Verifies the signature against the provided wallet address
2. Retrieves the player's $VIRAL token balance
3. Updates the challenge whitelist with the player's information
4. Sends a notification to Discord via webhook
5. Returns the game server IP address to the player

### POST /reward

Processes a tournament reward for a winning player.

#### Request Body

- `username` (required): The Minecraft username of the winner
- `secret` (required): Server secret for authentication

#### Response

- `success`: Boolean indicating success
- `transaction`: The blockchain transaction ID of the reward

#### Authentication

Authentication is handled through a server secret.

#### Error Responses

- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid secret
- `404 Not Found`: No active game tournament found
- `404 Not Found`: Winner not found in whitelist
- `404 Not Found`: Tournament program info not found
- `500 Internal Server Error`: Internal server error

#### Processing Details

1. Finds the active tournament with game integration
2. Locates the winner's address from the whitelist
3. Concludes the tournament on-chain with the winner's address
4. Adds a victory message to the chat
5. Updates the challenge status to "concluded"

### POST /chat

Adds a chat message from the Minecraft server to the challenge chat.

#### Request Body

- `username` (required): The Minecraft username of the sender
- `content` (required): The chat message content
- `secret` (required): Server secret for authentication

#### Response

- `success`: Boolean indicating success

#### Authentication

Authentication is handled through a server secret.

#### Error Responses

- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid secret
- `404 Not Found`: No active game challenge found
- `500 Internal Server Error`: Internal server error

#### Processing Details

1. Verifies the server secret
2. Finds the active game challenge
3. Creates a chat message with the appropriate role (assistant for viral_steve, player for others)
4. Stores the message in the database
