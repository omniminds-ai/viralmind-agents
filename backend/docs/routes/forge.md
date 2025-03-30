# Forge API

## Overview

The Forge API provides endpoints for managing training pools, apps, tasks, and race submissions. It handles wallet connections, pool creation and management, app generation, and race data uploads.

## Base Path

```
/api/forge
```

## Endpoints

### POST /upload-race

Uploads race data for processing.

#### Request Body (Form Data)

- `file` (required): The race data file (ZIP containing required files)

#### Response

- `message`: Success message
- `submissionId`: ID of the created submission
- `files`: Array of uploaded files with their S3 keys and sizes

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware.

#### Error Responses

- `400 Bad Request`: No file uploaded
- `400 Bad Request`: Missing required file
- `400 Bad Request`: Generated time expired
- `400 Bad Request`: Pool not found
- `400 Bad Request`: Upload limit reached
- `400 Bad Request`: Submission data already uploaded
- `500 Internal Server Error`: Failed to upload race data

### GET /submission/:id

Gets the status of a specific submission.

#### URL Parameters

- `id` (required): The submission ID

#### Response

- `status`: Current processing status
- `grade_result`: Grading result if available
- `error`: Error message if any
- `meta`: Submission metadata
- `files`: Array of uploaded files
- `reward`: Reward amount
- `maxReward`: Maximum possible reward
- `clampedScore`: Clamped score value
- `createdAt`: Timestamp when the submission was created
- `updatedAt`: Timestamp when the submission was last updated

#### Authentication

No authentication required.

#### Error Responses

- `404 Not Found`: Submission not found
- `500 Internal Server Error`: Failed to get submission status

### GET /submissions

Lists all submissions for the authenticated wallet address.

#### Response

Array of submission objects sorted by creation date (newest first).

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware.

#### Error Responses

- `500 Internal Server Error`: Failed to list submissions

### GET /pool-submissions/:poolId

Lists all submissions for a specific pool.

#### URL Parameters

- `poolId` (required): The pool ID

#### Response

Array of submission objects sorted by creation date (newest first).

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware. The authenticated user must be the owner of the pool.

#### Error Responses

- `400 Bad Request`: Pool ID is required
- `403 Forbidden`: Not authorized to view submissions for this pool
- `404 Not Found`: Pool not found
- `500 Internal Server Error`: Failed to list pool submissions

### POST /connect

Stores a wallet address for a connection token.

#### Request Body

- `token` (required): The connection token
- `address` (required): The wallet address
- `signature` (optional): Signature for verification
- `timestamp` (optional): Timestamp for signature verification

#### Response

- `success`: Boolean indicating success

#### Authentication

No authentication required, but signature verification is performed if provided.

#### Error Responses

- `400 Bad Request`: Token and address are required
- `400 Bad Request`: Timestamp expired
- `400 Bad Request`: Invalid signature
- `400 Bad Request`: Signature verification failed
- `500 Internal Server Error`: Failed to connect wallet

### GET /check-connection

Checks the connection status for a token.

#### Query Parameters

- `token` (required): The connection token

#### Response

- `connected`: Boolean indicating if the token is connected
- `address`: The connected wallet address if any

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Token is required
- `500 Internal Server Error`: Failed to check connection status

### POST /chat

Handles chat interactions with the AI assistant for forge tasks.

#### Request Body

- `messages` (required): Array of chat messages
- `task_prompt` (required): The task prompt
- `app` (required): App information object

#### Response

- `role`: "assistant"
- `content`: The assistant's response
- `tool_calls`: Tool calls if any

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Messages array, task prompt, and app info are required
- `500 Internal Server Error`: Failed to process chat message

### POST /refresh

Refreshes the balance and status of a training pool.

#### Request Body

- `id` (required): The pool ID

#### Response

Pool object with updated balance and status information.

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware. The authenticated user must be the owner of the pool.

#### Error Responses

- `400 Bad Request`: Pool ID is required
- `403 Forbidden`: Not authorized to refresh this pool
- `404 Not Found`: Training pool not found
- `500 Internal Server Error`: Failed to refresh pool balance

### POST /list

Lists all training pools owned by the authenticated wallet address.

#### Response

Array of pool objects with demonstration counts and balances.

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware.

#### Error Responses

- `500 Internal Server Error`: Failed to list training pools

### POST /create

Creates a new training pool.

#### Request Body

- `name` (required): Pool name
- `skills` (required): Array of skills
- `token` (required): Token information
- `pricePerDemo` (optional): Price per demonstration (defaults to 10)
- `apps` (optional): Array of predefined apps

#### Response

The created pool object.

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware.

#### Error Responses

- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Failed to create training pool

### POST /update

Updates an existing training pool.

#### Request Body

- `id` (required): The pool ID
- `name` (optional): New pool name
- `status` (optional): New pool status
- `skills` (optional): New array of skills
- `pricePerDemo` (optional): New price per demonstration
- `apps` (optional): New array of apps
- `uploadLimit` (optional): New upload limit settings

#### Response

The updated pool object.

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware. The authenticated user must be the owner of the pool.

#### Error Responses

- `400 Bad Request`: Pool ID is required
- `400 Bad Request`: Invalid status
- `400 Bad Request`: Cannot update status: pool has insufficient funds
- `403 Forbidden`: Not authorized to update this pool
- `404 Not Found`: Training pool not found
- `500 Internal Server Error`: Failed to update training pool

### GET /gym

Gets all active gym races.

#### Response

Array of active gym race objects sorted by creation date (newest first).

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to get gym races

### GET /reward

Calculates the reward for a submission to a specific pool.

#### Query Parameters

- `poolId` (required): The pool ID

#### Response

- `time`: Current time rounded down to the last minute
- `maxReward`: Maximum reward amount
- `pricePerDemo`: Price per demonstration

#### Authentication

Requires wallet authentication via the `requireWalletAddress` middleware.

#### Error Responses

- `400 Bad Request`: Missing or invalid poolId
- `400 Bad Request`: Pool has insufficient funds
- `404 Not Found`: Pool not found
- `500 Internal Server Error`: Failed to calculate reward

### POST /generate

Generates app and task content using OpenAI based on a prompt.

#### Request Body

- `prompt` (required): The prompt to send to OpenAI

#### Response

- `content`: The generated content (parsed JSON if possible)
- `parsing_error` (optional): Error message if JSON parsing failed

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Prompt is required
- `500 Internal Server Error`: Failed to generate content

### GET /balance/:address

Gets the $VIRAL token balance for a wallet address.

#### URL Parameters

- `address` (required): The wallet address

#### Response

- `balance`: The token balance

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Address is required
- `500 Internal Server Error`: Failed to get balance

### GET /tasks

Gets all tasks with filtering options.

#### Query Parameters

- `pool_id` (optional): Filter by pool ID
- `min_reward` (optional): Minimum reward amount
- `max_reward` (optional): Maximum reward amount
- `categories` (optional): Comma-separated list of categories
- `query` (optional): Search query for app name and task prompts

#### Response

Array of task objects with app information and limit details.

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to get tasks

### GET /apps

Gets all apps with filtering options.

#### Query Parameters

- `pool_id` (optional): Filter by pool ID
- `min_reward` (optional): Minimum reward amount
- `max_reward` (optional): Maximum reward amount
- `categories` (optional): Comma-separated list of categories
- `query` (optional): Search query for app name and task prompts

#### Response

Array of app objects with tasks and limit information.

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to get apps

### GET /pools

Gets all available forge pools (non-sensitive information).

#### Response

Array of live pool objects with basic information.

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to get pools

### GET /categories

Gets all possible categories across all apps.

#### Response

Array of unique category names sorted alphabetically.

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to get categories
