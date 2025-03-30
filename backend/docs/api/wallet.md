# Wallet API

The Wallet API provides endpoints for wallet connection and token balance retrieval.

## Base URL

```
/api/v1/wallet
```

## Endpoints

### Connect Wallet

Associates a wallet address with a connection token.

**Endpoint:** `POST /connect`

**Request Body:**
```json
{
  "token": "string",
  "address": "string",
  "signature": "string (optional)",
  "timestamp": "number (optional)"
}
```

**Parameters:**
- `token` (required): The connection token to associate with the wallet address
- `address` (required): The Solana wallet address
- `signature` (optional): Base64-encoded signature for verification
- `timestamp` (optional): Timestamp when the signature was created

**Validation:**
- `token` must be a non-empty string
- `address` must be a valid Solana wallet address
- `signature` must be a string if provided
- `timestamp` must be a non-negative number if provided

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Error Responses:**
- `400 Bad Request`: If the timestamp is expired (older than 5 minutes)
- `400 Bad Request`: If the signature verification fails
- `500 Internal Server Error`: If there's an error verifying the signature

**Notes:**
- If signature and timestamp are provided, the API verifies the signature against the message: `viralmind desktop\nnonce: {timestamp}`
- For backward compatibility, connections without signatures are allowed but logged as warnings

### Check Connection Status

Checks if a connection token is associated with a wallet address.

**Endpoint:** `GET /connection`

**Query Parameters:**
- `token` (required): The connection token to check

**Validation:**
- `token` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true|false,
    "address": "string|null"
  }
}
```

**Error Responses:**
- `400 Bad Request`: If the token parameter is missing or invalid

### Get Token Balance

Retrieves the $VIRAL token balance for a wallet address.

**Endpoint:** `GET /balance/:address`

**URL Parameters:**
- `address` (required): The Solana wallet address to check

**Validation:**
- `address` must be a string

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": "number"
  }
}
```

**Error Responses:**
- `400 Bad Request`: If the address parameter is missing or invalid
- `500 Internal Server Error`: If there's an error retrieving the balance from the blockchain
