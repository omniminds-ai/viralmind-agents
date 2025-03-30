# Authentication Changes

This document outlines the changes to authentication when migrating from the legacy API to the v1 API.

## Authentication Methods

The v1 API continues to use the same authentication methods as the legacy API:

### Wallet Connect Token

Many endpoints require authentication via a wallet connection token.

- **Header**: `x-connect-token`
- **Format**: String token that has been previously associated with a wallet address

### Wallet Address Header

Some endpoints use the wallet address directly as an authentication mechanism.

- **Header**: `x-wallet-address`
- **Format**: Solana wallet address string

## Authentication Middleware

The v1 API uses the same `requireWalletAddress` middleware for authentication, but with standardized error responses:

1. Extracts the `x-connect-token` from request headers
2. Looks up the token in the database to find the associated wallet address
3. Attaches the wallet address to the request object for use in route handlers
4. Returns a standardized error response if the token is missing or invalid

## Error Response Changes

The main change in authentication is the standardized error response format:

**Legacy:**
```json
{
  "error": "Connect token is required"
}
```

or

```json
{
  "error": "Invalid connect token"
}
```

**v1:**
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
```

## Client Code Updates

To handle these changes in your client code, you'll need to update your authentication error handling:

### Example Client Code Update (JavaScript)

**Legacy:**
```javascript
// Making an authenticated request
fetch('/api/forge/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(data => {
  if (data.error) {
    if (data.error === 'Connect token is required' || data.error === 'Invalid connect token') {
      // Handle authentication error
      console.error('Authentication error:', data.error);
      // Redirect to login page
    } else {
      // Handle other errors
      console.error('Error:', data.error);
    }
    return;
  }
  
  // Process data
  console.log('Pools:', data);
})
.catch(error => {
  console.error('Network error:', error);
});
```

**v1:**
```javascript
// Making an authenticated request
fetch('/api/v1/forge', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(result => {
  if (!result.success) {
    const { code, message } = result.error;
    
    if (code === 'UNAUTHORIZED') {
      // Handle authentication error
      console.error('Authentication error:', message);
      // Redirect to login page
    } else {
      // Handle other errors
      console.error(`Error (${code}):`, message);
    }
    return;
  }
  
  // Process data
  console.log('Pools:', result.data);
})
.catch(error => {
  console.error('Network error:', error);
});
```

## Endpoint-Specific Authentication

Each endpoint in the v1 API has specific authentication requirements. Refer to the endpoint-specific documentation for details on the authentication requirements for each endpoint.

Some endpoints require no authentication, while others require wallet authentication via the `requireWalletAddress` middleware.
