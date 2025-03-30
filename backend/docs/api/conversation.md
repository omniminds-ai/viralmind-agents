# Conversation API

The Conversation API provides endpoints for submitting messages to challenges and interacting with AI agents.

## Base URL

```
/api/v1/conversation
```

## Endpoints

### Submit Message

Submits a message to a challenge conversation and streams the AI response.

**Endpoint:** `POST /submit/:id`

**URL Parameters:**
- `id` (required): The ID of the challenge

**Request Body:**
```json
{
  "prompt": "string",
  "signature": "string",
  "walletAddress": "string"
}
```

**Parameters:**
- `prompt` (required): The message to send to the AI
- `signature` (required): The transaction signature for payment verification
- `walletAddress` (required): The Solana wallet address of the user

**Validation:**
- `id` must be a non-empty string
- `prompt` must be a non-empty string
- `signature` must be a string with at least 10 characters
- `walletAddress` must be a valid Solana wallet address

**Response:**
- Content-Type: `text/event-stream`
- The response is streamed as text chunks, with the initial chunk containing:
  ```json
  {
    "content": "",
    "screenshot": {
      "url": "string",
      "date": "date"
    }
  }
  ```
- Subsequent chunks contain the AI's response text
- Tool call results and errors are also streamed as they occur

**Error Responses:**
- `404 Not Found`: If the challenge is not found
- `400 Bad Request`: If the challenge validation fails
- `400 Bad Request`: If the transaction verification fails
- Various streaming errors may occur during the conversation

**Notes:**
- The API verifies the transaction signature against the blockchain to ensure payment
- For game-based challenges, the API ends the response immediately after saving the user message
- For other challenges, the API captures a screenshot, applies filters to the prompt, and streams the AI response
- The API supports an agentic loop where the AI can make tool calls (e.g., computer actions via VNC)
- The API implements retry logic with exponential backoff for handling errors during streaming
- The API updates tournament scores for score-based challenges
- The conversation context is limited by the challenge's `contextLimit` setting
- The API enforces character limits and other filters based on challenge settings
