# Forge Upload API

## Overview

The Forge Upload API provides endpoints for uploading large files in chunks, which improves reliability and allows for resumable uploads. This is primarily used for uploading race recordings and related data.

## Base Path

```
/api/forge/upload
```

## Endpoints

### POST /init

Initializes a new chunked upload session.

#### Request Body

- `totalChunks` (required): Total number of chunks to expect
- `metadata` (required): Metadata about the upload, including:
  - `poolId` (optional): Pool ID if applicable
  - `generatedTime` (optional): Timestamp when content was generated
  - `id` (required): Unique identifier for the race

#### Response

- `uploadId`: Unique ID for this upload session
- `expiresIn`: Seconds until this session expires (24 hours)
- `chunkSize`: Maximum chunk size in bytes (100MB)

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware.

#### Error Responses

- `400 Bad Request`: Missing required fields
- `400 Bad Request`: Invalid number of chunks
- `500 Internal Server Error`: Failed to initialize upload

### POST /chunk/:uploadId

Uploads a single chunk of the file.

#### URL Parameters

- `uploadId` (required): The upload session ID from init

#### Request Body (Form Data)

- `chunk` (required): The binary chunk data (file)
- `chunkIndex` (required): Zero-based index of this chunk
- `checksum` (required): SHA256 hash of the chunk for verification

#### Response

- `uploadId`: The upload session ID
- `chunkIndex`: The index of the uploaded chunk
- `received`: Number of chunks received so far
- `total`: Total number of chunks expected
- `progress`: Upload progress percentage

#### Authentication

Requires wallet authentication and a valid upload session.

#### Error Responses

- `400 Bad Request`: No chunk uploaded
- `400 Bad Request`: Invalid chunk index
- `400 Bad Request`: Checksum is required
- `400 Bad Request`: Checksum verification failed
- `404 Not Found`: Upload session not found or expired
- `500 Internal Server Error`: Failed to process chunk

### GET /status/:uploadId

Gets the current status of an upload.

#### URL Parameters

- `uploadId` (required): The upload session ID

#### Response

- `uploadId`: The upload session ID
- `received`: Number of chunks received
- `total`: Total number of chunks
- `progress`: Upload progress percentage
- `createdAt`: Timestamp when the session was created
- `lastUpdated`: Timestamp when the session was last updated

#### Authentication

Requires wallet authentication and a valid upload session.

#### Error Responses

- `404 Not Found`: Upload session not found or expired
- `500 Internal Server Error`: Failed to get upload status

### DELETE /cancel/:uploadId

Cancels an in-progress upload and cleans up temporary files.

#### URL Parameters

- `uploadId` (required): The upload session ID

#### Response

- `message`: "Upload cancelled successfully"

#### Authentication

Requires wallet authentication and a valid upload session.

#### Error Responses

- `404 Not Found`: Upload session not found or expired
- `500 Internal Server Error`: Failed to cancel upload

### POST /complete/:uploadId

Completes the upload process, combines chunks, processes the file, and adds the submission to the processing queue.

#### URL Parameters

- `uploadId` (required): The upload session ID

#### Response (Success)

- `message`: "Upload completed successfully"
- `submissionId`: ID of the created submission
- `files`: Array of uploaded files with their S3 keys and sizes

#### Response (Incomplete Upload)

- `error`: "Upload incomplete"
- `received`: Number of chunks received
- `total`: Total number of chunks
- `missing`: Array of indices of missing chunks

#### Authentication

Requires wallet authentication and a valid upload session.

#### Error Responses

- `400 Bad Request`: Upload incomplete
- `400 Bad Request`: Missing required file
- `400 Bad Request`: Generated time expired
- `400 Bad Request`: Pool not found
- `400 Bad Request`: Pool has insufficient funds
- `400 Bad Request`: Pool is not active
- `400 Bad Request`: Submission data already uploaded
- `404 Not Found`: Upload session not found or expired
- `500 Internal Server Error`: Failed to complete upload

## Processing Details

1. The upload process begins with initializing a session
2. Chunks are uploaded individually with checksums for verification
3. When all chunks are received, they are combined into a single file
4. The file is extracted and verified to contain all required components
5. Files are uploaded to S3 for storage
6. A submission record is created in the database
7. The submission is added to a processing queue for further handling
8. Temporary files and the upload session are cleaned up
