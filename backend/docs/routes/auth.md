# Authentication Middleware

## Overview

The authentication middleware provides functionality to authenticate API requests by resolving a connect token to a wallet address. This middleware is used to protect routes that require authentication.

## Implementation

The middleware is implemented in `backend/src/middleware/auth.ts` and exports the following function:

### `requireWalletAddress`

This middleware function validates that a request includes a valid connect token and resolves it to a wallet address.

#### Process

1. Extracts the connect token from the `x-connect-token` header
2. Validates that the token exists and is a string
3. Looks up the token in the database to find the associated wallet address
4. If found, adds the wallet address to the request object as `req.walletAddress`
5. If not found or invalid, throws an unauthorized error

#### Error Handling

- If no token is provided or it's not a string: Returns a 401 Unauthorized error with message "Connect token is required"
- If the token is invalid (not found in database): Returns a 401 Unauthorized error with message "Invalid connect token"

## Usage

This middleware is used in routes that require wallet authentication. It's typically applied as a route middleware in Express:

```typescript
router.get('/protected-route', requireWalletAddress, (req, res) => {
  // The wallet address is available as req.walletAddress
  // Route handler implementation
});
```

Routes that use this middleware will have access to the authenticated wallet address via `req.walletAddress`.
