# Forge Upload API Migration

This document outlines the changes needed to migrate from the legacy Forge Upload API to the v1 Forge Upload API.

## Base URL Change

- **Legacy:** `/api/forge/upload`
- **v1:** `/api/v1/forge/upload`

## Endpoint Changes

The Forge Upload API has been consolidated into the Forge Submissions API in the v1 API. The main upload functionality is now available at:

- **v1:** `/api/v1/forge/submissions/upload`

This means that all upload-related functionality should now use the Forge Submissions API endpoints.

## Client Code Updates

### Example: Uploading a File

**Legacy:**
```javascript
const formData = new FormData();
formData.append('file', fileBlob);

fetch('/api/forge/upload', {
  method: 'POST',
  headers: {
    'x-connect-token': token
  },
  body: formData
})
.then(response => response.json())
.then(result => {
  console.log('Upload result:', result);
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
    console.log('Upload result:', result.data);
  } else {
    console.error('Error:', result.error.message);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

## Response Format Change

**Legacy Response:**
```json
{
  "message": "Race data uploaded successfully",
  "submissionId": "123",
  "files": [
    {
      "file": "input_log.jsonl",
      "s3Key": "s3-key-1",
      "size": 1000
    },
    {
      "file": "meta.json",
      "s3Key": "s3-key-2",
      "size": 500
    },
    {
      "file": "recording.mp4",
      "s3Key": "s3-key-3",
      "size": 10000
    }
  ]
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "message": "Race data uploaded successfully",
    "submissionId": "123",
    "files": [
      {
        "file": "input_log.jsonl",
        "s3Key": "s3-key-1",
        "size": 1000
      },
      {
        "file": "meta.json",
        "s3Key": "s3-key-2",
        "size": 500
      },
      {
        "file": "recording.mp4",
        "s3Key": "s3-key-3",
        "size": 10000
      }
    ]
  }
}
```

## Error Handling

The v1 API uses standardized error responses:

**Legacy Error:**
```json
{
  "error": "No file uploaded"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "No file uploaded",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Forge Upload APIs use the same authentication mechanism (wallet connect token), but with standardized error responses in the v1 API.

## Validation

The v1 API adds explicit validation for the uploaded file:

- The file must be a ZIP archive
- The ZIP archive must contain the required files:
  - `input_log.jsonl`
  - `meta.json`
  - `recording.mp4`
- Various upload limits are enforced:
  - Daily upload limits for gyms
  - Total upload limits for gyms
  - Per-task upload limits
  - Per-task gym-wide limits
