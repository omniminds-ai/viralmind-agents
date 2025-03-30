# Settings API

The Settings API provides endpoints for retrieving application settings and configuration data.

## Base URL

```
/api/v1/settings
```

## Endpoints

### Get Settings

Retrieves global application settings, including challenges, pages, and other configuration data.

**Endpoint:** `GET /`

**Query Parameters:**
- None required

**Response:**
```json
{
  "success": true,
  "data": {
    "endpoints": "array|null",
    "faq": "array|null",
    "challenges": "array",
    "jailToken": "object|null",
    "activeChallenge": "object|null",
    "concludedChallenges": "array",
    "treasury": "number",
    "total_payout": "number",
    "breakAttempts": "number",
    "solPrice": "number"
  }
}
```

**Response Details:**
- `endpoints`: API endpoint information from the 'api-endpoints' page
- `faq`: FAQ entries from the 'faq' page
- `challenges`: All challenges in the system
- `jailToken`: Information about the VIRAL token from the 'viral-token' page
- `activeChallenge`: The currently active or upcoming challenge, with prize calculations
- `concludedChallenges`: Past challenges sorted by most recent first
- `treasury`: Total treasury amount in USD
- `total_payout`: Total payout amount in USD
- `breakAttempts`: Count of user chat attempts
- `solPrice`: Current SOL price in USDT

**Error Responses:**
- `500 Internal Server Error`: If there's an error retrieving the settings data

**Notes:**
- The active challenge includes additional calculated fields:
  - `prize`: The winning prize or entry fee * 100
  - `usdPrize`: The prize converted to USD based on current SOL price
- Concluded challenges are sorted by expiry date (most recent first) and include the same prize calculations

### Get Treasury Balance

Retrieves the current balance of the treasury wallet.

**Endpoint:** `GET /treasury`

**Query Parameters:**
- None required

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": "number"
  }
}
```

**Response Details:**
- `balance`: The current balance of VIRAL tokens in the treasury wallet

**Error Responses:**
- `500 Internal Server Error`: If there's an error retrieving the balance from the blockchain
