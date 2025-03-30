# General Changes

This document outlines the common changes that apply to all API endpoints when migrating from the legacy API to the v1 API.

## Base URL Change

All endpoints have been updated to use a new base URL pattern:

- **Legacy:** `/api/[resource]`
- **v1:** `/api/v1/[resource]`

For example:
- Legacy: `GET /api/settings`
- v1: `GET /api/v1/settings`

## Response Format Standardization

### Success Responses

The v1 API uses a standardized response format for all successful responses:

**Legacy (varies by endpoint):**
```json
{
  "data1": "value1",
  "data2": "value2"
}
```

**v1 (standardized):**
```json
{
  "success": true,
  "data": {
    "data1": "value1",
    "data2": "value2"
  }
}
```

### Error Responses

Error responses have also been standardized:

**Legacy (varies by endpoint):**
```json
{
  "error": "Error message"
}
```

**v1 (standardized):**
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

## Client Code Updates

To handle these changes in your client code, you'll need to:

1. Update all API endpoint URLs to use the new `/api/v1/` prefix
2. Update response handling to extract data from the `data` field of successful responses
3. Update error handling to extract error information from the `error` object

### Example Client Code Update (JavaScript)

**Legacy:**
```javascript
// Making a request
fetch('/api/settings')
  .then(response => response.json())
  .then(data => {
    // Use data directly
    console.log(data.endpoints);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
// Making a request
fetch('/api/v1/settings')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      // Extract data from the data field
      const data = result.data;
      console.log(data.endpoints);
    } else {
      // Handle error
      console.error('Error:', result.error.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

## HTTP Status Codes

The v1 API uses HTTP status codes more consistently:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Content Types

All JSON responses use the `application/json` content type with UTF-8 encoding.

Streaming responses (like those from the conversation API) use `text/event-stream`.
