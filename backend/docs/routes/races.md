# Races API

## Overview

The Races API provides endpoints for managing virtual desktop races, where users complete tasks in a virtual environment to earn rewards. It handles session management, quest generation, progress tracking, and reward distribution.

## Base Path

```
/api/races
```

## Endpoints

### GET /

Lists all available races.

#### Response

Array of race objects.

#### Authentication

No authentication required.

#### Error Responses

- `404 Not Found`: No races found
- `500 Internal Server Error`: Failed to fetch races

### GET /treasury-balance

Gets the current balance of the treasury wallet.

#### Response

- `balance`: The current token balance of the treasury

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to get treasury balance

### POST /:id/start

Starts a new race session for a specific race.

#### URL Parameters

- `id` (required): The race ID

#### Request Body

- `address` (required): The wallet address of the user
- `region` (optional): The VPS region to use (us-east, us-west, eu-central, ap-southeast)

#### Response

- `sessionId`: The ID of the created session
- `vm_ip`: The IP address of the virtual machine
- `vm_port`: The port of the virtual machine
- `vm_credentials`: Credentials for accessing the virtual machine
- `guacURL`: URL for accessing the Guacamole client

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Address is required
- `404 Not Found`: Race not found
- `500 Internal Server Error`: Failed to start race

### GET /session/:id

Gets the status of a race session.

#### URL Parameters

- `id` (required): The session ID

#### Response

- `status`: The current status of the session
- `vm_credentials`: Credentials for accessing the virtual machine
- `created_at`: Timestamp when the session was created
- `updated_at`: Timestamp when the session was last updated
- `preview`: Screenshot preview of the session

#### Authentication

No authentication required.

#### Error Responses

- `404 Not Found`: Session not found
- `410 Gone`: Session expired
- `500 Internal Server Error`: Failed to fetch session

### POST /session/:id/stop

Stops a race session and processes rewards.

#### URL Parameters

- `id` (required): The session ID

#### Response

- `success`: Boolean indicating success
- `totalRewards`: Total rewards earned (if session was active)

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to stop session

### PUT /session/:id

Updates the status of a race session.

#### URL Parameters

- `id` (required): The session ID

#### Request Body

- `status` (required): The new status (active, completed, expired)

#### Response

- `status`: The updated status of the session
- `vm_credentials`: Credentials for accessing the virtual machine
- `created_at`: Timestamp when the session was created
- `updated_at`: Timestamp when the session was last updated

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Invalid status
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Failed to update session

### POST /feedback

Submits feedback or a race idea.

#### Request Body

- `raceIdea` (required): The race idea or feedback

#### Response

- `success`: Boolean indicating success
- `message`: Confirmation message

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Race idea is required
- `500 Internal Server Error`: Failed to submit feedback

### GET /active

Checks if the user has an active race session.

#### Headers

- `x-wallet-address` (required): The wallet address of the user

#### Response

- `active`: Boolean indicating if an active session exists
- `sessionId`: The ID of the active session (if active)

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Wallet address is required
- `500 Internal Server Error`: Failed to check for active race

### GET /history

Lists all race sessions for a user.

#### Headers

- `x-wallet-address` (required): The wallet address of the user

#### Response

Array of session objects with enriched data including:
- `_id`: Session ID
- `status`: Session status
- `challenge`: Challenge ID
- `category`: Race category
- `video_path`: Path to the session recording
- `created_at`: Timestamp when the session was created
- `transaction_signature`: Blockchain transaction signature
- `preview`: Screenshot preview
- `actionTokens`: Number of actions taken
- `earnings`: Total earnings from the session
- `title`: Session title

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Wallet address is required
- `404 Not Found`: No races found
- `500 Internal Server Error`: Failed to fetch history

### POST /session/:id/hint

Requests a hint for the current quest or generates an initial quest if none exists.

#### URL Parameters

- `id` (required): The session ID

#### Request Body

- `screenshot` (required): Screenshot data from the virtual machine

#### Response

If no quest exists:
- `quest`: The generated quest
- `hint`: Initial hint for the quest
- `maxReward`: Maximum possible reward
- `events`: Array of created events

If quest exists:
- `hint`: The generated hint
- `reasoning`: Reasoning behind the hint
- `isCompleted`: Boolean indicating if the quest is completed
- `newQuest`: New quest if the previous one was completed
- `maxReward`: Maximum possible reward for the new quest
- `events`: Array of created events

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Session not found
- `400 Bad Request`: Race session has expired
- `400 Bad Request`: No active guacamole session
- `400 Bad Request`: Screenshot data is required
- `500 Internal Server Error`: Failed to generate hint

### GET /export

Exports training events for a single race session.

#### Query Parameters

- `sessionId` (required): The session ID

#### Response

Object containing session metadata and an array of events.

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Session ID is required
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Failed to export events

### POST /export

Exports training events for multiple race sessions.

#### Request Body

- `sessionIds` (required): Array of session IDs

#### Response

Array of objects containing session metadata and events.

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Session IDs array is required
- `404 Not Found`: No sessions found
- `500 Internal Server Error`: Failed to export events
