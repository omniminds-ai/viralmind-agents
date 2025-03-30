# Forge API Migration

This document outlines the changes needed to migrate from the legacy Forge API to the v1 Forge API.

## Base URL Change

- **Legacy:** `/api/forge`
- **v1:** `/api/v1/forge`

## Endpoint Restructuring

The v1 Forge API has been restructured into subdirectories:

- **Submissions API:** `/api/v1/forge/submissions`
- **Apps API:** `/api/v1/forge/apps`

## Endpoint Changes

### Gym Endpoint

**Legacy:**
- **Endpoint:** `GET /gym`
- **Response:** Direct array of gym races

**v1:**
- **Endpoint:** `GET /gym`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "_id": "123",
    "status": "active",
    "type": "gym",
    "createdAt": "2023-01-01T00:00:00.000Z"
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
      "status": "active",
      "type": "gym",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Submissions Endpoints

#### Get User Submissions

**Legacy:**
- **Endpoint:** `GET /submissions`
- **Response:** Direct array of submissions

**v1:**
- **Endpoint:** `GET /submissions/user`
- **Response:** Standardized format with `success` and `data` fields

#### Get Pool Submissions

**Legacy:**
- **Endpoint:** `GET /pool-submissions/:poolId`
- **Response:** Direct array of submissions

**v1:**
- **Endpoint:** `GET /submissions/pool/:poolId`
- **Response:** Standardized format with `success` and `data` fields

#### Get Submission Status

**Legacy:**
- **Endpoint:** `GET /submission/:id`
- **Response:** Direct submission object

**v1:**
- **Endpoint:** `GET /submissions/:id`
- **Response:** Standardized format with `success` and `data` fields

#### Upload Submission

**Legacy:**
- **Endpoint:** `POST /upload-race`
- **Response:** Direct object with message, submissionId, and files

**v1:**
- **Endpoint:** `POST /submissions/upload`
- **Response:** Standardized format with `success` and `data` fields

### Apps Endpoints

#### Get App Categories

**Legacy:**
- **Endpoint:** `GET /categories`
- **Response:** Direct array of categories

**v1:**
- **Endpoint:** `GET /apps/categories`
- **Response:** Standardized format with `success` and `data` fields

#### Generate Apps

**Legacy:**
- **Endpoint:** `POST /generate`
- **Response:** Direct object with content and parsing_error

**v1:**
- **Endpoint:** `POST /apps`
- **Response:** Standardized format with `success` and `data` fields

#### Get Tasks

**Legacy:**
- **Endpoint:** `GET /tasks`
- **Response:** Direct array of tasks

**v1:**
- **Endpoint:** `GET /apps/tasks`
- **Response:** Standardized format with `success` and `data` fields

#### Get Apps

**Legacy:**
- **Endpoint:** `GET /apps`
- **Response:** Direct array of apps

**v1:**
- **Endpoint:** `GET /apps`
- **Response:** Standardized format with `success` and `data` fields

### Other Endpoints

Several other endpoints have been moved or consolidated in the v1 API:

| Legacy Endpoint | v1 Endpoint | Notes |
|-----------------|-------------|-------|
| `POST /connect` | Moved to wallet API | Wallet connection functionality |
| `GET /check-connection` | Moved to wallet API | Wallet connection check |
| `POST /chat` | Moved to a separate API | Chat functionality |
| `POST /refresh` | Consolidated | Pool refresh functionality |
| `POST /list` | Consolidated | Pool listing functionality |
| `POST /create` | Consolidated | Pool creation functionality |
| `POST /update` | Consolidated | Pool update functionality |
| `GET /balance/:address` | Moved to wallet API | Wallet balance functionality |
| `GET /pools` | Consolidated | Pool listing functionality |

## Validation Changes

The v1 API adds explicit validation for request parameters. For example:

- For `/submissions/pool/:poolId`:
  - `poolId` must be a string

- For `/apps/tasks`:
  - `pool_id` must be a string if provided
  - `min_reward` must be a string
  - `max_reward` must be a string
  - `categories` must be a string if provided
  - `query` must be a string if provided

## Client Code Updates

### Example: Fetching User Submissions

**Legacy:**
```javascript
fetch('/api/forge/submissions', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(submissions => {
  console.log('Submissions:', submissions);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
fetch('/api/v1/forge/submissions/user', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  }
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('Submissions:', result.data);
  } else {
    console.error('Error:', result.error.message);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

### Example: Uploading a Submission

**Legacy:**
```javascript
const formData = new FormData();
formData.append('file', fileBlob);

fetch('/api/forge/upload-race', {
  method: 'POST',
  headers: {
    'x-connect-token': token
  },
  body: formData
})
.then(response => response.json())
.then(result => {
  console.log('Submission ID:', result.submissionId);
  console.log('Files:', result.files);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
const formData = new FormData();
formData.append('file', fileBlob);

fetch('/api/v1/forge/submissions/upload', {
  method: 'POST',
  headers: {
    'x-connect-token': token
  },
  body: formData
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('Submission ID:', result.data.submissionId);
    console.log('Files:', result.data.files);
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
  "error": "Pool not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Pool not found",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Forge APIs use the same authentication mechanism (wallet connect token), but with standardized error responses in the v1 API.
