# Races API

The Races API provides endpoints for managing race sessions, including starting, monitoring, and stopping races.

## Base URL

```
/api/v1/races
```

## Endpoints

### List All Races

Retrieves a list of all available races.

**Endpoint:** `GET /`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "prompt": "string",
      "status": "string",
      "created_at": "date",
      "updated_at": "date"
      // Additional race properties
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: If no races are found

### Start a Race Session

Starts a new race session for a specific race.

**Endpoint:** `POST /:id/start`

**URL Parameters:**
- `id` (required): The ID of the race to start

**Request Body:**
```json
{
  "address": "string",
  "region": "string (optional)"
}
```

**Parameters:**
- `address` (required): The Solana wallet address of the user
- `region` (optional): The VPS region to use (us-east, us-west, eu-central, ap-southeast)

**Validation:**
- `address` must be a valid Solana wallet address
- `region` must be a valid region if provided

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "vm_ip": "string",
    "vm_port": "number",
    "vm_credentials": {
      "username": "string",
      "password": "string",
      "guacToken": "string",
      "guacConnectionId": "string",
      "guacClientId": "string"
    },
    "guacURL": "string"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the race is not found
- `500 Internal Server Error`: If there's an error creating the race session

### Get Race Session Status

Retrieves the status of a race session.

**Endpoint:** `GET /session/:id`

**URL Parameters:**
- `id` (required): The ID of the race session

**Validation:**
- `id` must be a string

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "string",
    "vm_credentials": {
      "username": "string",
      "password": "string",
      "guacToken": "string",
      "guacConnectionId": "string",
      "guacClientId": "string"
    },
    "created_at": "date",
    "updated_at": "date",
    "preview": "string (optional)"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the session is not found
- `410 Gone`: If the session has expired

### Stop a Race Session

Stops an active race session.

**Endpoint:** `POST /session/:id/stop`

**URL Parameters:**
- `id` (required): The ID of the race session

**Validation:**
- `id` must be a string

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "string",
    "message": "string"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the session is not found
- `500 Internal Server Error`: If there's an error stopping the session

### Update Race Session Status

Updates the status of a race session.

**Endpoint:** `PUT /session/:id`

**URL Parameters:**
- `id` (required): The ID of the race session

**Request Body:**
```json
{
  "status": "string"
}
```

**Parameters:**
- `status` (required): The new status of the session (active, completed, expired)

**Validation:**
- `id` must be a string
- `status` must be one of: active, completed, expired

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "string",
    "vm_credentials": {
      "username": "string",
      "password": "string",
      "guacToken": "string",
      "guacConnectionId": "string",
      "guacClientId": "string"
    },
    "created_at": "date",
    "updated_at": "date"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the session is not found
- `400 Bad Request`: If the status is invalid

### Submit Race Feedback

Submits feedback or a race idea.

**Endpoint:** `POST /feedback`

**Request Body:**
```json
{
  "raceIdea": "string"
}
```

**Parameters:**
- `raceIdea` (required): The feedback or race idea

**Validation:**
- `raceIdea` must be a string between 1 and 1000 characters

**Response:**
```json
{
  "success": true,
  "data": "Feedback received"
}
```

**Error Responses:**
- `400 Bad Request`: If the raceIdea is invalid

### Request a Hint

Requests a hint for the current quest in a race session. Also creates the initial quest if there isn't one.

**Endpoint:** `POST /session/:id/hint`

**URL Parameters:**
- `id` (required): The ID of the race session

**Request Body:**
```json
{
  "screenshot": "string"
}
```

**Parameters:**
- `screenshot` (required): A screenshot of the current state of the race

**Validation:**
- `id` must be a string
- `screenshot` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "quest": "string (if initial quest)",
    "hint": "string (if initial quest)",
    "maxReward": "number (if initial quest)",
    "events": "array (if initial quest)",
    "message": "string (if still generating)",
    "isGenerating": "boolean (if still generating)"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the session is not found
- `400 Bad Request`: If the race session has expired
- `400 Bad Request`: If there's no active guacamole session

### Check for Active Race Session

Checks if the user has an active race session.

**Endpoint:** `GET /active`

**Headers:**
- `x-wallet-address` (required): The wallet address of the user

**Response:**
```json
{
  "success": true,
  "data": {
    "active": "boolean",
    "sessionId": "string (if active)"
  }
}
```

**Error Responses:**
- `400 Bad Request`: If the wallet address is missing

### Get Race Session History

Retrieves the history of race sessions for a user.

**Endpoint:** `GET /history`

**Headers:**
- `x-wallet-address` (required): The wallet address of the user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "status": "string",
      "challenge": "string",
      "category": "string",
      "video_path": "string (optional)",
      "created_at": "date",
      "transaction_signature": "string (optional)",
      "preview": "string (optional)",
      "actionTokens": "number",
      "earnings": "number",
      "title": "string"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: If the wallet address is missing
- `404 Not Found`: If no races are found

### Export Session Data

Exports training events for a specific race session.

**Endpoint:** `GET /export`

**Query Parameters:**
- `sessionId` (required): The ID of the race session

**Validation:**
- `sessionId` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "string",
    "challenge": "string",
    "category": "string",
    "transaction_signature": "string (optional)",
    "events": [
      {
        "session_id": "string",
        "challenge": "string",
        "category": "string",
        "type": "string",
        "message": "string",
        "timestamp": "number",
        "frame": "number",
        "coordinates": "object (optional)",
        "trajectory": "array (optional)",
        "metadata": "object (optional)"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: If the session is not found
- `400 Bad Request`: If the sessionId is invalid

### Export Multiple Sessions Data

Exports training events for multiple race sessions.

**Endpoint:** `POST /export`

**Request Body:**
```json
{
  "sessionIds": ["string"]
}
```

**Parameters:**
- `sessionIds` (required): An array of race session IDs

**Validation:**
- `sessionIds` must be a non-empty array

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "string",
      "challenge": "string",
      "category": "string",
      "video_path": "string (optional)",
      "events": [
        {
          "session_id": "string",
          "challenge": "string",
          "category": "string",
          "type": "string",
          "message": "string",
          "timestamp": "number",
          "frame": "number",
          "coordinates": "object (optional)",
          "trajectory": "array (optional)",
          "metadata": "object (optional)"
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: If no sessions are found
- `400 Bad Request`: If the sessionIds array is invalid
