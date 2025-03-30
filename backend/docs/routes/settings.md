# Settings API

## Overview

The Settings API provides a single endpoint for retrieving application-wide settings, including challenges, pages, endpoints, FAQ, token information, and statistics.

## Base Path

```
/api/settings
```

## Endpoints

### GET /

Retrieves all application settings and related information.

#### Response

A JSON object containing:

- `endpoints`: API endpoints documentation from the 'api-endpoints' page
- `faq`: Frequently asked questions from the 'faq' page
- `challenges`: All challenges in the system
- `jailToken`: Information about the VIRAL token from the 'viral-token' page
- `activeChallenge`: The currently active or upcoming challenge, with prize calculations
- `concludedChallenges`: Array of concluded challenges sorted by most recent first, with prize calculations
- `treasury`: Total treasury amount in USD
- `total_payout`: Total payout amount in USD
- `breakAttempts`: Total number of user message attempts
- `solPrice`: Current SOL price in USDT

#### Authentication

No authentication required.

#### Error Responses

- `500 Internal Server Error`: Failed to fetch settings

#### Processing Details

1. Retrieves settings from the database
2. Retrieves pages from the database, including API endpoints, FAQ, and token information
3. Gets the current SOL price in USDT
4. Finds the active or upcoming challenge
5. Calculates prize amounts for the active challenge
6. Gets concluded challenges and calculates their prize amounts
7. Calculates total treasury and payout amounts
8. Gets the total number of break attempts
9. Combines all information into a single response object
