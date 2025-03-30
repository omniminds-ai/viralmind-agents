# Challenges API Migration

This document outlines the changes needed to migrate from the legacy Challenges API to the v1 Challenges API.

## Base URL Change

- **Legacy:** `/api/challenges`
- **v1:** `/api/v1/challenges`

## Endpoint Changes

The main changes in the Challenges API are the standardized response format and improved validation.

### Get Challenges

**Legacy:**
- **Endpoint:** `GET /`
- **Response:** Direct array of challenges

**v1:**
- **Endpoint:** `GET /`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "_id": "123",
    "name": "Challenge 1",
    "description": "Description 1",
    "status": "active"
  },
  {
    "_id": "456",
    "name": "Challenge 2",
    "description": "Description 2",
    "status": "upcoming"
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
      "name": "Challenge 1",
      "description": "Description 1",
      "status": "active"
    },
    {
      "_id": "456",
      "name": "Challenge 2",
      "description": "Description 2",
      "status": "upcoming"
    }
  ]
}
```

### Get Challenge by ID

**Legacy:**
- **Endpoint:** `GET /:id`
- **Response:** Direct challenge object

**v1:**
- **Endpoint:** `GET /:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "name": "Challenge 1",
  "description": "Description 1",
  "status": "active",
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-01-31T23:59:59.999Z"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "name": "Challenge 1",
    "description": "Description 1",
    "status": "active",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-31T23:59:59.999Z"
  }
}
```

## Client Code Updates

### Example: Fetching Challenges

**Legacy:**
```javascript
fetch('/api/challenges')
  .then(response => response.json())
  .then(challenges => {
    console.log('Challenges:', challenges);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
fetch('/api/v1/challenges')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Challenges:', result.data);
    } else {
      console.error('Error:', result.error.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### Example: Fetching a Challenge by ID

**Legacy:**
```javascript
const challengeId = '123';

fetch(`/api/challenges/${challengeId}`)
  .then(response => response.json())
  .then(challenge => {
    console.log('Challenge:', challenge);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
const challengeId = '123';

fetch(`/api/v1/challenges/${challengeId}`)
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Challenge:', result.data);
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

Neither the legacy nor the v1 Challenges API requires authentication for read operations.
