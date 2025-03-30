# Authentication

The API uses a token-based authentication system for wallet connections. This document outlines the authentication mechanisms used across the API endpoints.

## Authentication Methods

### Wallet Connect Token

Many endpoints require authentication via a wallet connection token.

- **Header**: `x-connect-token`
- **Format**: String token that has been previously associated with a wallet address

### Wallet Address Header

Some endpoints use the wallet address directly as an authentication mechanism.

- **Header**: `x-wallet-address`
- **Format**: Solana wallet address string

## Authentication Middleware

### `requireWalletAddress`

This middleware resolves a connect token to a wallet address:

1. Extracts the `x-connect-token` from request headers
2. Looks up the token in the database to find the associated wallet address
3. Attaches the wallet address to the request object for use in route handlers
4. Returns a 401 Unauthorized error if the token is missing or invalid

## Error Responses

Authentication failures return standard error responses:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Connect token is required",
    "details": {}
  }
}
```

or

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid connect token",
    "details": {}
  }
}
