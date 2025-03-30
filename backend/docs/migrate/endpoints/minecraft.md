# Minecraft API Migration

This document outlines the changes needed to migrate from the legacy Minecraft API to the v1 Minecraft API.

## Base URL Change

- **Legacy:** `/api/minecraft`
- **v1:** `/api/v1/minecraft`

## Endpoint Changes

The main changes in the Minecraft API are the standardized response format and improved validation.

### Get Server Status

**Legacy:**
- **Endpoint:** `GET /status`
- **Response:** Direct status object

**v1:**
- **Endpoint:** `GET /status`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "online": true,
  "players": 5,
  "maxPlayers": 20,
  "version": "1.19.2"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "online": true,
    "players": 5,
    "maxPlayers": 20,
    "version": "1.19.2"
  }
}
```

### Get Player Data

**Legacy:**
- **Endpoint:** `GET /player/:username`
- **Response:** Direct player object

**v1:**
- **Endpoint:** `GET /player/:username`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "username": "player1",
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "lastLogin": "2023-01-01T00:00:00.000Z",
  "playtime": 3600,
  "stats": {
    "kills": 10,
    "deaths": 5
  }
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "username": "player1",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "lastLogin": "2023-01-01T00:00:00.000Z",
    "playtime": 3600,
    "stats": {
      "kills": 10,
      "deaths": 5
    }
  }
}
```

### Get Online Players

**Legacy:**
- **Endpoint:** `GET /players/online`
- **Response:** Direct array of players

**v1:**
- **Endpoint:** `GET /players/online`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
[
  {
    "username": "player1",
    "uuid": "123e4567-e89b-12d3-a456-426614174000"
  },
  {
    "username": "player2",
    "uuid": "223e4567-e89b-12d3-a456-426614174000"
  }
]
```

**v1 Response:**
```json
{
  "success": true,
  "data": [
    {
      "username": "player1",
      "uuid": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "username": "player2",
      "uuid": "223e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

### Execute Command

**Legacy:**
- **Endpoint:** `POST /command`
- **Response:** Direct result object

**v1:**
- **Endpoint:** `POST /command`
- **Response:** Standardized format with `success` and `data` fields

#### Request Body

**Both Legacy and v1:**
```json
{
  "command": "give player1 diamond 1"
}
```

#### Response Format Change

**Legacy Response:**
```json
{
  "success": true,
  "output": "Gave 1 diamond to player1"
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "output": "Gave 1 diamond to player1"
  }
}
```

## Client Code Updates

### Example: Fetching Server Status

**Legacy:**
```javascript
fetch('/api/minecraft/status')
  .then(response => response.json())
  .then(status => {
    console.log('Server status:', status);
    console.log('Online:', status.online);
    console.log('Players:', status.players);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
fetch('/api/v1/minecraft/status')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      const status = result.data;
      console.log('Server status:', status);
      console.log('Online:', status.online);
      console.log('Players:', status.players);
    } else {
      console.error('Error:', result.error.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### Example: Executing a Command

**Legacy:**
```javascript
fetch('/api/minecraft/command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify({
    command: 'give player1 diamond 1'
  })
})
.then(response => response.json())
.then(result => {
  console.log('Command result:', result.output);
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
fetch('/api/v1/minecraft/command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify({
    command: 'give player1 diamond 1'
  })
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    console.log('Command result:', result.data.output);
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
  "error": "Player not found"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Player not found",
    "details": {}
  }
}
```

## Authentication

Both the legacy and v1 Minecraft APIs use the same authentication mechanism (wallet connect token) for protected endpoints like command execution, but with standardized error responses in the v1 API.

## Validation

The v1 API adds explicit validation for request parameters:

- For `GET /player/:username`:
  - `username` must be a string with valid Minecraft username format

- For `POST /command`:
  - `command` must be a non-empty string
