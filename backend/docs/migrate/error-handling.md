# Error Handling Changes

This document outlines the changes to error handling when migrating from the legacy API to the v1 API.

## Standardized Error Response Format

The v1 API uses a standardized error response format across all endpoints:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional error details
    }
  }
}
```

## Common Error Codes

The v1 API uses a set of standardized error codes:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | The request was malformed or contained invalid parameters |
| `UNAUTHORIZED` | 401 | Authentication is required or the provided credentials are invalid |
| `INVALID_WALLET_SIGNATURE` | 400 | The wallet signature provided is invalid |
| `FORBIDDEN` | 403 | The authenticated user does not have permission to access the resource |
| `NOT_FOUND` | 404 | The requested resource was not found |
| `REQ_VALIDATION_ERROR` | 400 | Request validation failed (invalid parameters) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests have been made in a given time period |
| `CONFLICT` | 409 | The request conflicts with the current state of the resource |
| `PAYMENT_REQUIRED` | 402 | Payment is required to access the resource |
| `GONE` | 410 | The resource is no longer available |
| `INTERNAL_SERVER_ERROR` | 500 | An unexpected error occurred on the server |
| `SERVICE_UNAVAILABLE` | 503 | The service is temporarily unavailable |
| `INSUFFICIENT_FUNDS` | 400 | The wallet does not have sufficient funds for the operation |
| `TRANSACTION_FAILED` | 400 | The blockchain transaction failed |
| `CHALLENGE_EXPIRED` | 400 | The challenge has expired |
| `UPLOAD_INCOMPLETE` | 400 | The upload is incomplete |

## Validation Errors

Validation errors include details about which fields failed validation:

```json
{
  "success": false,
  "error": {
    "code": "REQ_VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": "Must be a valid email address",
        "age": "Must be at least 18"
      }
    }
  }
}
```

## Client Code Updates

To handle these changes in your client code, you'll need to update your error handling logic:

### Example Client Code Update (JavaScript)

**Legacy:**
```javascript
fetch('/api/settings')
  .then(response => {
    if (!response.ok) {
      throw new Error('API request failed');
    }
    return response.json();
  })
  .then(data => {
    // Process data
  })
  .catch(error => {
    console.error('Error:', error);
    // Display generic error message
  });
```

**v1:**
```javascript
fetch('/api/v1/settings')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      // Process data
      const data = result.data;
      // ...
    } else {
      // Handle specific error
      const { code, message, details } = result.error;
      
      switch (code) {
        case 'UNAUTHORIZED':
          // Handle authentication error
          console.error('Authentication required:', message);
          // Redirect to login page
          break;
        case 'REQ_VALIDATION_ERROR':
          // Handle validation error
          console.error('Validation error:', message);
          // Display field-specific errors
          const fieldErrors = details?.fields || {};
          Object.entries(fieldErrors).forEach(([field, errorMsg]) => {
            console.error(`${field}: ${errorMsg}`);
            // Update UI to show field errors
          });
          break;
        default:
          // Handle other errors
          console.error(`Error (${code}):`, message);
          // Display error message to user
      }
    }
  })
  .catch(error => {
    console.error('Network error:', error);
    // Display network error message
  });
```

## Global Error Handling

The v1 API implements global error handling middleware that:

1. Catches all errors thrown in route handlers
2. Converts various error types to standardized API responses
3. Handles specific error types like:
   - Mongoose validation errors
   - MongoDB duplicate key errors
   - Mongoose cast errors
   - Custom API errors

This means that all errors, whether expected or unexpected, will be returned in the standardized format.
