# Conversation API Migration

This document outlines the changes needed to migrate from the legacy Conversation API to the v1 Conversation API.

## Base URL Change

- **Legacy:** `/api/conversation`
- **v1:** `/api/v1/conversation`

## Endpoint Changes

### Submit Message

**Legacy:**
- **Endpoint:** `POST /submit/:id`
- **Response:** Streaming response with text chunks

**v1:**
- **Endpoint:** `POST /submit/:id`
- **Response:** Streaming response with text chunks (format unchanged)

#### Request Validation

The v1 API adds explicit validation for the request parameters:

- `id` must be a non-empty string
- `prompt` must be a non-empty string
- `signature` must be a string with at least 10 characters
- `walletAddress` must be a valid Solana wallet address

#### Error Response Format

While the streaming response format remains the same, error responses now follow the standardized format:

**Legacy Error:**
```json
{
  "error": "Challenge not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Challenge not found",
    "details": {}
  }
}
```

## Client Code Updates

### Example: Submitting a Message

**Legacy:**
```javascript
const challengeId = '123';
const messageData = {
  prompt: 'Hello, AI!',
  signature: 'transaction-signature',
  walletAddress: 'solana-wallet-address'
};

fetch(`/api/conversation/submit/${challengeId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(messageData)
})
.then(response => {
  if (!response.ok) {
    return response.json().then(error => {
      throw new Error(error.error || 'Unknown error');
    });
  }
  
  // Handle streaming response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  function processStream({ done, value }) {
    if (done) return;
    
    const chunk = decoder.decode(value);
    console.log('Received chunk:', chunk);
    
    // Continue reading
    return reader.read().then(processStream);
  }
  
  return reader.read().then(processStream);
})
.catch(error => {
  console.error('Error:', error.message);
});
```

**v1:**
```javascript
const challengeId = '123';
const messageData = {
  prompt: 'Hello, AI!',
  signature: 'transaction-signature',
  walletAddress: 'solana-wallet-address'
};

fetch(`/api/v1/conversation/submit/${challengeId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(messageData)
})
.then(response => {
  // Check for non-streaming error responses
  if (response.headers.get('Content-Type')?.includes('application/json')) {
    return response.json().then(result => {
      if (!result.success) {
        throw new Error(result.error.message || 'Unknown error');
      }
      return result;
    });
  }
  
  // Handle streaming response (unchanged)
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  function processStream({ done, value }) {
    if (done) return;
    
    const chunk = decoder.decode(value);
    console.log('Received chunk:', chunk);
    
    // Continue reading
    return reader.read().then(processStream);
  }
  
  return reader.read().then(processStream);
})
.catch(error => {
  console.error('Error:', error.message);
});
```

## Error Handling

The v1 API uses standardized error responses for non-streaming errors:

**Legacy Error:**
```json
{
  "error": "Challenge not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Challenge not found",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Conversation APIs use blockchain transaction verification for authentication:

- The signature must be valid
- The transaction must be verified against the tournament PDA
- The transaction must include the correct entry fee
- The wallet address must match the transaction

No changes are needed to the authentication mechanism itself, but error responses for authentication failures now follow the standardized format.
