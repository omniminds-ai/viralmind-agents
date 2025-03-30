# Settings API Migration

This document outlines the changes needed to migrate from the legacy Settings API to the v1 Settings API.

## Base URL Change

- **Legacy:** `/api/settings`
- **v1:** `/api/v1/settings`

## Endpoint Changes

### Get Settings

**Legacy:**
- **Endpoint:** `GET /`
- **Response:** Direct JSON object with settings data

**v1:**
- **Endpoint:** `GET /`
- **Response:** Standardized format with `success` and `data` fields

#### Response Format Change

**Legacy Response:**
```json
{
  "endpoints": [...],
  "faq": [...],
  "challenges": [...],
  "jailToken": {...},
  "activeChallenge": {...},
  "concludedChallenges": [...],
  "treasury": 1000,
  "total_payout": 500,
  "breakAttempts": 1000,
  "solPrice": 100
}
```

**v1 Response:**
```json
{
  "success": true,
  "data": {
    "endpoints": [...],
    "faq": [...],
    "challenges": [...],
    "jailToken": {...},
    "activeChallenge": {...},
    "concludedChallenges": [...],
    "treasury": 1000,
    "total_payout": 500,
    "breakAttempts": 1000,
    "solPrice": 100
  }
}
```

### New Endpoints

The v1 API adds a new endpoint for retrieving the treasury balance:

#### Get Treasury Balance

- **Endpoint:** `GET /treasury`
- **Response:** Treasury balance information

```json
{
  "success": true,
  "data": {
    "balance": 1000
  }
}
```

## Client Code Updates

### Example: Fetching Settings

**Legacy:**
```javascript
fetch('/api/settings')
  .then(response => response.json())
  .then(settings => {
    console.log('Endpoints:', settings.endpoints);
    console.log('FAQ:', settings.faq);
    console.log('Active Challenge:', settings.activeChallenge);
    // ...
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**v1:**
```javascript
fetch('/api/v1/settings')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      const settings = result.data;
      console.log('Endpoints:', settings.endpoints);
      console.log('FAQ:', settings.faq);
      console.log('Active Challenge:', settings.activeChallenge);
      // ...
    } else {
      console.error('Error:', result.error.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### Example: Fetching Treasury Balance (New Endpoint)

```javascript
fetch('/api/v1/settings/treasury')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Treasury Balance:', result.data.balance);
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
  "error": "Failed to fetch settings"
}
```

**v1 Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to fetch settings",
    "details": {}
  }
}
```

## Authentication

Neither the legacy nor the v1 Settings API requires authentication.
