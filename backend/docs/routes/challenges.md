# Challenges API

## Overview

The Challenges API provides endpoints for retrieving challenge information, including challenge details, chat history, and screenshots.

## Base Path

```
/api/challenges
```

## Endpoints

### GET /get-challenge

Retrieves information about a specific challenge by name.

#### Query Parameters

- `name` (required): The name of the challenge to retrieve
- `initial` (optional): Flag to indicate if this is the initial request
- `price` (optional): The message price

#### Response

A JSON object containing:

- `challenge`: Challenge details including:
  - `_id`: Challenge ID
  - `title`: Challenge title
  - `label`: Challenge label
  - `task`: Challenge task description
  - `tools_description`: Description of available tools
  - `custom_rules`: Custom rules for the challenge
  - `disable`: Disabled features
  - `start_date`: Challenge start date
  - `charactersPerWord`: Characters per word ratio
  - `level`: Challenge difficulty level
  - `model`: AI model used
  - `image`: Challenge image URL
  - `pfp`: Profile picture URL
  - `status`: Challenge status (active, concluded, upcoming)
  - `name`: Challenge name
  - `deployed`: Deployment status
  - `idl`: Interface description language
  - `tournamentPDA`: Tournament PDA
  - `entryFee`: Entry fee
  - `characterLimit`: Character limit
  - `contextLimit`: Context limit
  - `chatLimit`: Chat limit
  - `initial_pool_size`: Initial pool size
  - `expiry`: Expiry date
  - `developer_fee`: Developer fee
  - `win_condition`: Win condition
  - `expiry_logic`: Expiry logic
  - `scores`: Scores
  - `stream_src`: Stream source
  - `system_message`: System message (only included if challenge not initialized)
- `break_attempts`: Number of break attempts
- `message_price`: Price per message
- `prize`: Challenge prize
- `usdMessagePrice`: Message price in USD
- `usdPrize`: Prize in USD
- `chatHistory`: Array of chat messages (if available)
- `expiry`: Challenge expiry date
- `solPrice`: SOL price in USDT
- `latestScreenshot`: Latest screenshot information (if available)
- `stream_src`: Stream source URL (if available)

#### Authentication

No authentication required.

#### Error Responses

- `404 Not Found`: Challenge not found
- `404 Not Found`: Challenge is not active
- `400 Bad Request`: Various error messages for invalid parameters or server issues
