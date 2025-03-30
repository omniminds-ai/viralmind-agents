# Error Handling

The API uses a standardized error handling mechanism across all endpoints. This document outlines the error handling approach and common error codes.

## Error Response Format

All API errors follow a consistent format:

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

## Global Error Handling

The API implements global error handling middleware that:

1. Catches all errors thrown in route handlers
2. Converts various error types to standardized API responses
3. Handles specific error types like:
   - Mongoose validation errors
   - MongoDB duplicate key errors
   - Mongoose cast errors
   - Custom API errors

## Error Handling Best Practices

When working with the API:

1. Always check the `success` field to determine if the request was successful
2. Handle common error codes appropriately in your client application
3. Use the `message` field for displaying user-friendly error messages
4. Check the `details` field for additional information about the error
