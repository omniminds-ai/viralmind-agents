# Gym API Migration

This document outlines the changes needed to migrate from the legacy Gym API to the v1 Gym API.

## Base URL Change

- **Legacy:** `/api/gym`
- **v1:** `/api/v1/gym`

## Endpoint Changes

The main changes in the Gym API are the standardized response format and improved validation.

### Get Gym Sessions

**Legacy:**
- **Endpoint:** `GET /sessions`
- **Response:** Direct array of gym sessions

**v1:**
- **Endpoint:** `GET /sessions`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "_id": "123",
    "userId": "456",
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "_id": "789",
    "userId": "456",
    "status": "completed",
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
]
```

**v1 Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "123",
      "userId": "456",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "789",
      "userId": "456",
      "status": "completed",
      "createdAt": "2023-01-02T00:00:00.000Z"
    }
  ]
}
```

### Get Gym Session by ID

**Legacy:**
- **Endpoint:** `GET /sessions/:id`
- **Response:** Direct session object

**v1:**
- **Endpoint:** `GET /sessions/:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "userId": "456",
  "status": "active",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T01:00:00.000Z"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "userId": "456",
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T01:00:00.000Z"
  }
}
```

### Create Gym Session

**Legacy:**
- **Endpoint:** `POST /sessions`
- **Response:** Direct session object

**v1:**
- **Endpoint:** `POST /sessions`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "userId": "456",
  "status": "active",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "userId": "456",
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Gym Session

**Legacy:**
- **Endpoint:** `PUT /sessions/:id`
- **Response:** Direct session object

**v1:**
- **Endpoint:** `PUT /sessions/:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "userId": "456",
  "status": "completed",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T02:00:00.000Z"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "userId": "456",
    "status": "completed",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T02:00:00.000Z"
  }
}
```

## Client Code Updates

### Example: Fetching Gym Sessions

**Legacy:**
```javascript
fetch('/api/gym/sessions', {
  headers: {
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(sessions => {
  console.log('Sessions:', sessions);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
fetch('/api/v1/gym/sessions', {
  headers: {
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('Sessions:', result.data);
  } else {
    console.error('Error:', result.error.message);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

### Example: Creating a Gym Session

**Legacy:**
```javascript
fetch('/api/gym/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify({
    // Session data
  })
})
.then(response => response.json())
.then(session => {
  console.log('New session:', session);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
fetch('/api/v1/gym/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify({
    // Session data
  })
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('New session:', result.data);
  } else {
    console.error('Error:', result.error.message);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

## Error Handling

The v1 API uses standardized error responses:

**Legacy Error:**
```json
{
  "error": "Session not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Session not found",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Gym APIs use the same authentication mechanism (wallet connect token), but with standardized error responses in the v1 API.

## Validation

The v1 API adds explicit validation for request parameters:

- For `GET /sessions/:id`:
  - `id` must be a string

- For `PUT /sessions/:id`:
  - `id` must be a string
  - Request body validation for status and other fields
