# Challenges API

The Challenges API provides endpoints for retrieving challenge information and chat history.

## Base URL

```
/api/v1/challenges
```

## Endpoints

### Get Challenge by Name

Retrieves a specific challenge by its name, including chat history and related information.

**Endpoint:** `GET /:name`

**URL Parameters:**
- `name` (required): The name of the challenge

**Query Parameters:**
- `initial` (optional): Flag to indicate if this is the initial request
- `price` (optional): Price for the challenge message (must be a non-negative number)

**Validation:**
- `name` must be a string
- `price` must be a non-negative number if provided

**Response:**
```json
{
  "success": true,
  "data": {
    "challenge": {
      "_id": "string",
      "title": "string",
      "label": "string",
      "task": "string",
      "tools_description": "string",
      "custom_rules": "string",
      "disable": "boolean",
      "start_date": "date",
      "charactersPerWord": "number",
      "level": "string",
      "model": "string",
      "image": "string",
      "pfp": "string",
      "status": "string",
      "name": "string",
      "deployed": "boolean",
      "idl": "object",
      "tournamentPDA": "string",
      "entryFee": "number",
      "characterLimit": "number",
      "contextLimit": "number",
      "chatLimit": "number",
      "initial_pool_size": "number",
      "expiry": "date",
      "developer_fee": "number",
      "win_condition": "string",
      "expiry_logic": "string",
      "scores": "array",
      "stream_src": "string",
      "system_message": "string (only for new challenges)"
    },
    "break_attempts": "number",
    "message_price": "number",
    "prize": "number",
    "usdMessagePrice": "number",
    "usdPrize": "number",
    "chatHistory": [
      {
        "challenge": "string",
        "role": "string",
        "content": "string",
        "display_name": "string",
        "address": "string",
        "txn": "string",
        "date": "date",
        "screenshot": "object",
        "tool_calls": "object (if tools_description not present)"
      }
    ],
    "expiry": "date",
    "solPrice": "number",
    "latestScreenshot": {
      "url": "string",
      "date": "date"
    },
    "stream_src": "string"
  }
}
```

**Error Responses:**
- `404 Not Found`: If the challenge is not found
- `400 Bad Request`: If the challenge is not active
- `400 Bad Request`: If the program ID or tournament PDA is not found
- `500 Internal Server Error`: If there's an error getting chat history or tournament data

**Notes:**
- For upcoming challenges, a simplified response is returned with basic challenge info
- For active challenges, the API attempts to get a screenshot via VNC or from chat history
- If the challenge has expired but is still marked as active, the API will conclude the tournament
- The chat history is returned in chronological order (oldest first)
- For new challenges, the system message is included in the response and initialized in the database

### List Challenges

Retrieves a list of challenges with optional filtering and pagination.

**Endpoint:** `GET /`

**Query Parameters:**
- `status` (optional): Filter by challenge status (active, upcoming, concluded, draft)
- `limit` (optional): Maximum number of challenges to return (default: 10, max: 100)
- `offset` (optional): Number of challenges to skip (default: 0)

**Validation:**
- `status` must be one of: active, upcoming, concluded, draft
- `limit` must be a number between 1 and 100
- `offset` must be a non-negative number

**Response:**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "_id": "string",
        "title": "string",
        "status": "string",
        "name": "string",
        // Additional challenge properties
      }
    ],
    "pagination": {
      "total": "number",
      "offset": "number",
      "limit": "number"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: If the query parameters are invalid
- `500 Internal Server Error`: If there's an error retrieving the challenges
