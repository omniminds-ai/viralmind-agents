# Streams API

The Streams API provides endpoints for real-time data streaming, including challenge chat streams and race data collection.

## Base URL

```
/api/v1/streams
```

## Endpoints

### Challenge Chat Stream

Establishes a Server-Sent Events (SSE) connection to stream chat messages for a specific challenge.

**Endpoint:** `GET /challenge-chat`

**Query Parameters:**
- `name` (required): The name of the challenge to stream chat messages for

**Validation:**
- `name` must be a non-empty string

**Response:**
- Content-Type: `text/event-stream`
- The response is a continuous stream of SSE messages with the following format:

```
data: {"type":"connection","message":"Connected to chat stream for [challenge name]"}

data: {"type":"message","message":{...chat data...}}
```

**Error Responses:**
- `400 Bad Request`: If the challenge name is missing
- `404 Not Found`: If the challenge is not found
- `404 Not Found`: If the challenge is not active, concluded, or upcoming

**Notes:**
- The connection remains open until the client disconnects
- New chat messages are automatically pushed to all connected clients
- The initial message confirms the connection was established
- Subsequent messages contain chat data as they are created in the database
- The client should handle reconnection if the connection is lost

### Race Data Collection

Collects and processes data from race sessions.

**Endpoint:** `POST /races/:stream/data`

**URL Parameters:**
- `stream` (required): The stream ID (Linux username for the user)

**Query Parameters:**
- `secret` (required): The AX Parser secret for authentication

**Request Body:**
```json
{
  "data": "object",
  "type": "string",
  "platform": "string"
}
```

**Parameters:**
- `data` (required): The data to be collected (object)
- `type` (required): The type of data being collected
- `platform` (required): The platform the data is coming from

**Validation:**
- `stream` must be a non-empty string
- `secret` must be a non-empty string
- `data` must be an object
- `type` must be a non-empty string
- `platform` must be a non-empty string

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "data_received",
    "timestamp": "string (ISO date)",
    "data_points": "number"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: If the AX Parser secret is incorrect
- `404 Not Found`: If no session is found for the provided stream ID

**Notes:**
- Data is collected and batched for a session
- After a timeout period (20 seconds of inactivity), the collected data is processed
- Processed data is compressed using zstd and stored in S3
- Only sessions with more than one data point are stored
- The system maintains a map of active data collection sessions
