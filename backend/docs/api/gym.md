# Gym API

The Gym API provides endpoints for generating desktop quests and checking progress on those quests.

## Base URL

```
/api/v1/gym
```

## Endpoints

### Request a Quest

Generates a new desktop quest or hint based on the user's prompt and installed applications.

**Endpoint:** `POST /quest`

**Request Body:**
```json
{
  "address": "string",
  "prompt": "string",
  "installed_applications": "string (optional)"
}
```

**Parameters:**
- `address` (required): The Solana wallet address of the user
- `prompt` (required): The prompt describing what kind of quest the user wants
- `installed_applications` (optional): A string listing the applications installed on the user's desktop

**Validation:**
- `address` must be a valid Solana wallet address
- `prompt` must be a non-empty string
- `installed_applications` must be a string if provided

**Response:**
```json
{
  "success": true,
  "data": {
    "quest": "string",
    "hint": "string",
    "subgoals": ["string"],
    "maxReward": "number",
    "events": [
      {
        "type": "string",
        "message": "string",
        "session": "string",
        "timestamp": "number",
        "metadata": "object"
      }
    ]
  }
}
```

**Response Details:**
- `quest`: The main quest description
- `hint`: An initial hint for the quest
- `subgoals`: An array of subgoals that make up the quest
- `maxReward`: The maximum reward available for completing the quest
- `events`: Training events created for this quest

**Error Responses:**
- `400 Bad Request`: If the request body is invalid
- `500 Internal Server Error`: If there's an error creating the session or generating the quest

**Notes:**
- If a session doesn't exist for the provided address, a new one is created
- The API stores the latest screenshot in the session metadata
- The quest is generated based on the prompt and installed applications

### Check Quest Progress

Checks the progress of a quest based on recent screenshots.

**Endpoint:** `POST /progress`

**Request Body:**
```json
{
  "quest": {
    "subgoals": ["string"]
  },
  "screenshots": ["string"]
}
```

**Parameters:**
- `quest` (required): An object containing the quest information, including subgoals
- `screenshots` (required): An array of screenshot URLs to analyze for progress

**Validation:**
- `quest` must be an object
- `screenshots` must be a non-empty array

**Response:**
```json
{
  "success": true,
  "data": {
    "completed_subgoals": [true, false, true],
    "completed_objectives": 2
  }
}
```

**Response Details:**
- `completed_subgoals`: An array of booleans indicating which subgoals have been completed
- `completed_objectives`: The total number of completed subgoals

**Error Responses:**
- `400 Bad Request`: If the request body is invalid
- `500 Internal Server Error`: If there's an error analyzing the screenshots

**Notes:**
- The API uses OpenAI's GPT-4o-mini model to analyze the screenshots
- The API takes up to the last 5 screenshots for analysis
- The response indicates which specific subgoals have been completed based on visual evidence
