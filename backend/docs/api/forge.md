# Forge API

The Forge API provides endpoints for managing forge applications, submissions, and related functionality.

## Base URL

```
/api/v1/forge
```

## Endpoints

### Get Active Gyms

Retrieves all active forge gyms.

**Endpoint:** `GET /gym`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "status": "string",
      "type": "string",
      "createdAt": "date",
      // Additional gym properties
    }
  ]
}
```

## Forge Submissions API

Base URL: `/api/v1/forge/submissions`

### Get User Submissions

Retrieves all submissions for the authenticated user.

**Endpoint:** `GET /user`

**Authentication:**
- Requires wallet address authentication via `requireWalletAddress` middleware

**Response:**
```json
[
  {
    "_id": "string",
    "address": "string",
    "meta": "object",
    "status": "string",
    "files": "array",
    "createdAt": "date",
    "updatedAt": "date"
    // Additional submission properties
  }
]
```

### Get Pool Submissions

Retrieves all submissions for a specific pool.

**Endpoint:** `GET /pool/:poolId`

**URL Parameters:**
- `poolId` (required): The ID of the pool

**Authentication:**
- Requires wallet address authentication via `requireWalletAddress` middleware

**Validation:**
- `poolId` must be a string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "address": "string",
      "meta": "object",
      "status": "string",
      "files": "array",
      "createdAt": "date",
      "updatedAt": "date"
      // Additional submission properties
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: If the pool is not found
- `401 Unauthorized`: If the user is not authorized to view submissions for this pool

### Upload Submission

Uploads a new forge submission.

**Endpoint:** `POST /upload`

**Authentication:**
- Requires wallet address authentication via `requireWalletAddress` middleware

**Request Body:**
- Multipart form data with a `file` field containing the submission data

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Race data uploaded successfully",
    "submissionId": "string",
    "files": [
      {
        "file": "string",
        "s3Key": "string",
        "size": "number"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: If no file is uploaded
- `400 Bad Request`: If a required file is missing
- `403 Forbidden`: If the timestamp is expired
- `403 Forbidden`: If an upload limit is reached
- `409 Conflict`: If the submission data already exists
- `500 Internal Server Error`: If there's an error uploading the race data

**Notes:**
- The uploaded file should be a ZIP archive containing:
  - `input_log.jsonl`: Input log data
  - `meta.json`: Metadata about the submission
  - `recording.mp4`: Recording of the race
- The API extracts these files, uploads them to S3, and creates a submission record
- Various upload limits are enforced:
  - Daily upload limits for gyms
  - Total upload limits for gyms
  - Per-task upload limits
  - Per-task gym-wide limits

### Get Submission Status

Retrieves the status of a submission.

**Endpoint:** `GET /:id`

**URL Parameters:**
- `id` (required): The ID of the submission

**Authentication:**
- Requires wallet address authentication via `requireWalletAddress` middleware

**Validation:**
- `id` must be a string

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "string",
    "grade_result": "object",
    "error": "string",
    "meta": "object",
    "files": "array",
    "reward": "number",
    "maxReward": "number",
    "clampedScore": "number",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the submission is not found

## Forge Apps API

Base URL: `/api/v1/forge/apps`

### Get App Categories

Retrieves all unique categories across all apps.

**Endpoint:** `GET /categories`

**Response:**
```json
{
  "success": true,
  "data": ["string"]
}
```

### Generate Apps

Generates new apps based on a prompt.

**Endpoint:** `POST /`

**Request Body:**
```json
{
  "prompt": "string"
}
```

**Parameters:**
- `prompt` (required): The prompt to generate apps from

**Validation:**
- `prompt` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "object"
  }
}
```

**Error Responses:**
- `500 Internal Server Error`: If there's an error generating the content

### Get Tasks

Retrieves tasks with filtering options.

**Endpoint:** `GET /tasks`

**Query Parameters:**
- `pool_id` (optional): Filter by pool ID
- `min_reward` (required): Minimum reward amount
- `max_reward` (required): Maximum reward amount
- `categories` (optional): Comma-separated list of categories
- `query` (optional): Text search for app name and task prompts

**Validation:**
- `pool_id` must be a string if provided
- `min_reward` must be a string
- `max_reward` must be a string
- `categories` must be a string if provided
- `query` must be a string if provided

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "prompt": "string",
      "uploadLimit": "number",
      "rewardLimit": "number",
      "uploadLimitReached": "boolean",
      "currentSubmissions": "number",
      "limitReason": "string",
      "app": {
        "_id": "string",
        "name": "string",
        "domain": "string",
        "description": "string",
        "categories": ["string"],
        "gymLimitType": "string",
        "gymSubmissions": "number",
        "gymLimitValue": "number",
        "pool_id": "object"
      }
    }
  ]
}
```

### Get Apps

Retrieves apps with filtering options.

**Endpoint:** `GET /`

**Query Parameters:**
- `pool_id` (optional): Filter by pool ID
- `min_reward` (required): Minimum reward amount
- `max_reward` (required): Maximum reward amount
- `categories` (optional): Comma-separated list of categories
- `query` (optional): Text search for app name and task prompts

**Validation:**
- `pool_id` must be a string if provided
- `min_reward` must be a string
- `max_reward` must be a string
- `categories` must be a string if provided
- `query` must be a string if provided

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "domain": "string",
      "description": "string",
      "categories": ["string"],
      "pool_id": "object",
      "tasks": [
        {
          "_id": "string",
          "prompt": "string",
          "uploadLimit": "number",
          "rewardLimit": "number",
          "uploadLimitReached": "boolean",
          "currentSubmissions": "number",
          "limitReason": "string"
        }
      ],
      "gymLimitReached": "boolean",
      "gymSubmissions": "number",
      "gymLimitType": "string",
      "gymLimitValue": "number"
    }
  ]
}
