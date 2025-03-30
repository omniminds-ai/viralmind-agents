# Streams API Migration

This document outlines the changes needed to migrate from the legacy Streams API to the v1 Streams API.

## Base URL Change

- **Legacy:** `/api/streams`
- **v1:** `/api/v1/streams`

## Endpoint Changes

The main changes in the Streams API are the standardized response format and improved validation.

### Get Streams

**Legacy:**
- **Endpoint:** `GET /`
- **Response:** Direct array of streams

**v1:**
- **Endpoint:** `GET /`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "_id": "123",
    "name": "Stream 1",
    "type": "video",
    "url": "https://example.com/stream1",
    "active": true
  },
  {
    "_id": "456",
    "name": "Stream 2",
    "type": "audio",
    "url": "https://example.com/stream2",
    "active": false
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
      "name": "Stream 1",
      "type": "video",
      "url": "https://example.com/stream1",
      "active": true
    },
    {
      "_id": "456",
      "name": "Stream 2",
      "type": "audio",
      "url": "https://example.com/stream2",
      "active": false
    }
  ]
}
```

### Get Stream by ID

**Legacy:**
- **Endpoint:** `GET /:id`
- **Response:** Direct stream object

**v1:**
- **Endpoint:** `GET /:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "name": "Stream 1",
  "type": "video",
  "url": "https://example.com/stream1",
  "active": true,
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
    "name": "Stream 1",
    "type": "video",
    "url": "https://example.com/stream1",
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T01:00:00.000Z"
  }
}
```

### Create Stream

**Legacy:**
- **Endpoint:** `POST /`
- **Response:** Direct stream object

**v1:**
- **Endpoint:** `POST /`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "name": "Stream 1",
  "type": "video",
  "url": "https://example.com/stream1",
  "active": true,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "name": "Stream 1",
    "type": "video",
    "url": "https://example.com/stream1",
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Stream

**Legacy:**
- **Endpoint:** `PUT /:id`
- **Response:** Direct stream object

**v1:**
- **Endpoint:** `PUT /:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "_id": "123",
  "name": "Stream 1 Updated",
  "type": "video",
  "url": "https://example.com/stream1",
  "active": true,
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
    "name": "Stream 1 Updated",
    "type": "video",
    "url": "https://example.com/stream1",
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T02:00:00.000Z"
  }
}
```

### Delete Stream

**Legacy:**
- **Endpoint:** `DELETE /:id`
- **Response:** Direct success message

**v1:**
- **Endpoint:** `DELETE /:id`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "message": "Stream deleted successfully"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "message": "Stream deleted successfully"
  }
}
```

## Client Code Updates

### Example: Fetching Streams

**Legacy:**
```javascript
fetch('/api/streams')
  .then(response => response.json())
  .then(streams => {
    console.log('Streams:', streams);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
fetch('/api/v1/streams')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Streams:', result.data);
    } else {
      console.error('Error:', result.error.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### Example: Creating a Stream

**Legacy:**
```javascript
const streamData = {
  name: 'New Stream',
  type: 'video',
  url: 'https://example.com/new-stream',
  active: true
};

fetch('/api/streams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify(streamData)
})
.then(response => response.json())
.then(stream => {
  console.log('New stream:', stream);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
const streamData = {
  name: 'New Stream',
  type: 'video',
  url: 'https://example.com/new-stream',
  active: true
};

fetch('/api/v1/streams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify(streamData)
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('New stream:', result.data);
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
  "error": "Stream not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Stream not found",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Streams APIs use the same authentication mechanism (wallet connect token) for protected endpoints, but with standardized error responses in the v1 API.

## Validation

The v1 API adds explicit validation for request parameters:

- For `GET /:id`, `PUT /:id`, and `DELETE /:id`:
  - `id` must be a string

- For `POST /` and `PUT /:id`:
  - `name` must be a non-empty string
  - `type` must be one of the allowed types
  - `url` must be a valid URL
  - `active` must be a boolean
