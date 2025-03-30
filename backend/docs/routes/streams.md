# Streams API

## Overview

The Streams API provides endpoints for real-time data streaming, including challenge chat messages and race data collection. It uses Server-Sent Events (SSE) for pushing updates to clients and handles data compression and storage.

## Base Path

```
/api/streams
```

## Endpoints

### GET /challenge-chat

Establishes a Server-Sent Events (SSE) connection to stream chat messages for a specific challenge.

#### Query Parameters

- `name` (required): The name of the challenge to stream chat messages for

#### Response

A continuous stream of Server-Sent Events with the following event types:

- `connection`: Initial connection confirmation
- `message`: New chat messages as they are added to the challenge

Each event is formatted as:

```
data: {"type":"event_type","message":event_data}
```

#### Authentication

No authentication required.

#### Error Responses

- `404 Not Found`: Challenge not found
- `404 Not Found`: Challenge is not active

#### Processing Details

1. Sets up appropriate headers for SSE connection
2. Validates that the challenge exists and has an allowed status
3. Sends an initial connection message
4. Adds the client to the set of connected clients
5. Streams new chat messages to all connected clients as they are added
6. Removes the client from the set when the connection is closed

### POST /races/:stream/data

Receives and processes data from race sessions, compressing and storing it in S3.

#### URL Parameters

- `stream` (required): The stream ID (Linux username for the user)

#### Query Parameters

- `secret` (required): Secret key for authentication

#### Request Body

- `data` (required): The data to be stored
- `type` (required): The type of data
- `platform` (required): The platform the data is from

#### Response

- `status`: "data_received"
- `timestamp`: ISO timestamp of when the data was received
- `data_points`: Number of data points collected for this session

#### Authentication

Authentication is handled through a secret key in the query parameters.

#### Error Responses

- `400 Bad Request`: Incorrect AX Parser secret
- `400 Bad Request`: No session present for the stream ID
- `500 Internal Server Error`: Failed to set up stream handler

#### Processing Details

1. Validates the secret key for authentication
2. Finds the race session associated with the stream ID
3. Adds the received data to the session's data collection
4. Sets a timeout to process the data after a period of inactivity
5. When the timeout triggers, compresses the collected data using zstd
6. Uploads the compressed data to S3 for storage
7. Cleans up the session data from memory
