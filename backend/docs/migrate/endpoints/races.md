# Races API Migration

This document outlines the changes needed to migrate from the legacy Races API to the v1 Races API.

## Base URL Change

- **Legacy:** `/api/races`
- **v1:** `/api/v1/races`

## Endpoint Changes

The main changes in the Races API are the standardized response format and improved validation.

### Get Races

**Legacy:**
- **Endpoint:** `GET /`
- **Response:** Direct array of races

**v1:**
- **Endpoint:** `GET /`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "_id": "123",
    "name": "Race 1",
    "description": "Description 1",
    "status": "active"
  },
  {
    "_id": "456",
    "name": "Race 2",
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
      "name": "Race 1",
      "description": "Description 1",
      "status": "active"
    },
    {
      "_id": "456",
      "name": "Race 2",
      "description": "Description 2",
      "status": "upcoming"
    }
  ]
}
```

### Get Race by ID

**Legacy:**
- **Endpoint:** `GET /:id`
- **Response:** Direct race object

**v1:**
- **Endpoint:** `GET /:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "name": "Race 1",
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
    "name": "Race 1",
    "description": "Description 1",
    "status": "active",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-31T23:59:59.999Z"
  }
}
```

### Get Race Sessions

**Legacy:**
- **Endpoint:** `GET /:id/sessions`
- **Response:** Direct array of sessions

**v1:**
- **Endpoint:** `GET /:id/sessions`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "_id": "123",
    "raceId": "456",
    "userId": "789",
    "status": "completed",
    "score": 100
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
      "raceId": "456",
      "userId": "789",
      "status": "completed",
      "score": 100
    }
  ]
}
```

### Join Race

**Legacy:**
- **Endpoint:** `POST /:id/join`
- **Response:** Direct session object

**v1:**
- **Endpoint:** `POST /:id/join`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "raceId": "456",
  "userId": "789",
  "status": "in_progress"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "raceId": "456",
    "userId": "789",
    "status": "in_progress"
  }
}
```

## Client Code Updates

### Example: Fetching Races

**Legacy:**
```javascript
fetch('/api/races')
  .then(response => response.json())
  .then(races => {
    console.log('Races:', races);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
fetch('/api/v1/races')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Races:', result.data);
    } else {
      console.error('Error:', result.error.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### Example: Joining a Race

**Legacy:**
```javascript
const raceId = '123';

fetch(`/api/races/${raceId}/join`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(session => {
  console.log('Session:', session);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
const raceId = '123';

fetch(`/api/v1/races/${raceId}/join`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('Session:', result.data);
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
  "error": "Race not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Race not found",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Races APIs use the same authentication mechanism (wallet connect token) for protected endpoints, but with standardized error responses in the v1 API.

## Validation

The v1 API adds explicit validation for request parameters:

- For `GET /:id`:
  - `id` must be a string

- For `POST /:id/join`:
  - `id` must be a string
