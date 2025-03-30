# Forge Upload API

The Forge Upload API provides endpoints for uploading large files in chunks, which improves reliability and allows for resumable uploads. This is particularly useful for submitting race recordings and related data.

## Base URL

```
/api/v1/forge/upload
```

## Authentication

All endpoints require wallet address authentication via the `requireWalletAddress` middleware.

## Endpoints

### Initialize Upload

Initializes a new chunked upload session.

**Endpoint:** `POST /init`

**Request Body:**
```json
{
  "totalChunks": "number",
  "metadata": {
    "id": "string",
    "poolId": "string (optional)",
    "generatedTime": "number (optional)",
    // Additional metadata
  }
}
```

**Parameters:**
- `totalChunks` (required): Total number of chunks to expect
- `metadata` (required): Metadata about the upload
  - `id` (required): Unique identifier for the race
  - `poolId` (optional): Pool ID if applicable
  - `generatedTime` (optional): Timestamp when content was generated

**Validation:**
- `totalChunks` must be an integer between 1 and 1000
- `metadata` must be an object

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "string",
    "expiresIn": "number",
    "chunkSize": "number"
  }
}
```

**Response Details:**
- `uploadId`: Unique ID for this upload session
- `expiresIn`: Seconds until this session expires (24 hours)
- `chunkSize`: Maximum chunk size in bytes (100MB)

**Error Responses:**
- `400 Bad Request`: If the request body is invalid
- `401 Unauthorized`: If the wallet address authentication fails

### Upload Chunk

Uploads a single chunk of the file.

**Endpoint:** `POST /chunk/:uploadId`

**URL Parameters:**
- `uploadId` (required): The upload session ID from init

**Request Body:**
- Multipart form data with:
  - `chunk` (file): The binary chunk data
  - `chunkIndex` (number): Zero-based index of this chunk
  - `checksum` (string): SHA256 hash of the chunk for verification

**Validation:**
- `uploadId` must be a non-empty string
- `chunkIndex` must be a non-negative integer
- `checksum` must be a valid SHA-256 hash (64 hex characters)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "string",
    "chunkIndex": "number",
    "received": "number",
    "total": "number",
    "progress": "number"
  }
}
```

**Response Details:**
- `uploadId`: The upload session ID
- `chunkIndex`: The index of the uploaded chunk
- `received`: Number of chunks received so far
- `total`: Total number of chunks expected
- `progress`: Upload progress percentage

**Error Responses:**
- `400 Bad Request`: If no chunk is uploaded
- `400 Bad Request`: If the chunk index is invalid
- `400 Bad Request`: If the checksum verification fails
- `404 Not Found`: If the upload session is not found

### Get Upload Status

Gets the current status of an upload.

**Endpoint:** `GET /status/:uploadId`

**URL Parameters:**
- `uploadId` (required): The upload session ID

**Validation:**
- `uploadId` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "string",
    "received": "number",
    "total": "number",
    "progress": "number",
    "createdAt": "date",
    "lastUpdated": "date"
  }
}
```

**Response Details:**
- `uploadId`: The upload session ID
- `received`: Number of chunks received
- `total`: Total number of chunks
- `progress`: Upload progress percentage
- `createdAt`: When the upload session was created
- `lastUpdated`: When the upload session was last updated

**Error Responses:**
- `404 Not Found`: If the upload session is not found

### Cancel Upload

Cancels an in-progress upload and cleans up temporary files.

**Endpoint:** `DELETE /cancel/:uploadId`

**URL Parameters:**
- `uploadId` (required): The upload session ID

**Validation:**
- `uploadId` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": "Upload cancelled successfully"
}
```

**Error Responses:**
- `404 Not Found`: If the upload session is not found

### Complete Upload

Completes the upload process, combines chunks, and processes the file.

**Endpoint:** `POST /complete/:uploadId`

**URL Parameters:**
- `uploadId` (required): The upload session ID

**Validation:**
- `uploadId` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Upload completed successfully",
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

**Response Details:**
- `message`: Success message
- `submissionId`: ID of the created submission
- `files`: Array of uploaded files with their S3 keys and sizes

**Error Responses:**
- `400 Bad Request`: If a required file is missing
- `400 Bad Request`: If the generated time has expired
- `404 Not Found`: If the upload session is not found
- `404 Not Found`: If the pool is not found
- `400 Bad Request`: If the pool is not active
- `409 Conflict`: If the submission data already exists
- `400 Bad Request`: If the upload is incomplete, with details about missing chunks

## Upload Process

1. **Initialize**: Create an upload session with metadata and total number of chunks
2. **Upload Chunks**: Send each chunk with its index and checksum
3. **Check Status**: Optionally check the upload status
4. **Complete**: Finalize the upload, which:
   - Combines all chunks into a single file
   - Extracts the ZIP file
   - Verifies required files are present
   - Uploads files to S3
   - Verifies pool status and balance if applicable
   - Creates a submission record
   - Adds the submission to the processing queue
   - Cleans up temporary files

## Required Files

The uploaded ZIP file must contain:
- `input_log.jsonl`: Input log data
- `meta.json`: Metadata about the submission
- `recording.mp4`: Recording of the race

## Example Usage

```javascript
// Initialize upload
const initResponse = await fetch('/api/v1/forge/upload/init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': 'user-token'
  },
  body: JSON.stringify({
    totalChunks: 3,
    metadata: { id: 'race-123', poolId: 'pool-456' }
  })
});
const { uploadId } = await initResponse.json().data;

// Upload chunks
for (let i = 0; i < 3; i++) {
  const chunk = getChunk(i); // Your function to get chunk data
  const checksum = calculateSHA256(chunk); // Your function to calculate SHA256

  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('chunkIndex', i);
  formData.append('checksum', checksum);

  await fetch(`/api/v1/forge/upload/chunk/${uploadId}`, {
    method: 'POST',
    headers: {
      'x-connect-token': 'user-token'
    },
    body: formData
  });
}

// Complete upload
const completeResponse = await fetch(`/api/v1/forge/upload/complete/${uploadId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': 'user-token'
  }
});
const result = await completeResponse.json();
console.log(`Upload completed with submission ID: ${result.data.submissionId}`);
