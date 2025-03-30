# Validation Changes

This document outlines the changes to request validation when migrating from the legacy API to the v1 API.

## Enhanced Validation System

The v1 API implements a robust validation system to ensure that all incoming requests contain valid data. This system includes:

1. Middleware functions for validating different parts of the request
2. Validation schemas that define the expected structure and rules
3. Common validation rules for various data types
4. Standardized validation error responses

## Validation Middleware

The v1 API provides three main validation middleware functions:

1. `validateBody` - Validates the request body
2. `validateQuery` - Validates query parameters
3. `validateParams` - Validates route parameters

Each middleware takes a validation schema that defines the expected structure and rules for the request data.

## Validation Schema Structure

A validation schema defines the expected fields and their validation rules:

```typescript
type ValidationSchema = Record<string, FieldValidation>;

type FieldValidation = {
  required?: boolean;
  rules?: ValidationRule[];
};

type ValidationRule = {
  validate: ((value: any) => boolean) | ((value: any) => Promise<boolean>);
  message: string;
};
```

## Common Validation Rules

The v1 API provides a set of common validation rules that are used across endpoints:

| Rule | Description |
|------|-------------|
| `isString()` | Validates that the value is a string |
| `isNumber()` | Validates that the value is a number |
| `isBoolean()` | Validates that the value is a boolean |
| `isArray()` | Validates that the value is an array |
| `isObject()` | Validates that the value is an object |
| `isDate()` | Validates that the value is a valid date |
| `minLength(min)` | Validates that the string has at least `min` characters |
| `maxLength(max)` | Validates that the string has at most `max` characters |
| `min(min)` | Validates that the number is at least `min` |
| `max(max)` | Validates that the number is at most `max` |
| `pattern(regex, message)` | Validates that the string matches the regex pattern |
| `isIn(values, message)` | Validates that the value is one of the provided values |
| `isSolanaAddress()` | Validates that the value is a valid Solana wallet address |
| `isValidName()` | Validates that the value contains only letters, numbers, and underscores |
| `isNonEmptyArray()` | Validates that the array has at least one element |
| `isInteger()` | Validates that the value is an integer |
| `isQueryNumber(min, max)` | Validates that the query parameter is a valid number within the specified range |
| `custom(validateFn, message)` | Creates a custom validation rule |

## Validation Error Responses

When validation fails, the v1 API returns a standardized error response:

```json
{
  "success": false,
  "error": {
    "code": "REQ_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "fieldName": "Error message for this field"
      }
    }
  }
}
```

## Client Code Updates

To handle these validation changes in your client code, you'll need to:

1. Ensure that all request data meets the validation requirements
2. Handle validation error responses appropriately

### Example Client Code Update (JavaScript)

**Legacy:**
```javascript
// Making a request with potentially invalid data
fetch('/api/forge/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify({
    name: 'My Pool',
    // Missing required fields
  })
})
.then(response => response.json())
.then(data => {
  // Process response
})
.catch(error => {
  console.error('Error:', error);
});
```

**v1:**
```javascript
// Making a request with validation handling
fetch('/api/v1/forge', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-connect-token': token
  },
  body: JSON.stringify({
    name: 'My Pool',
    skills: ['JavaScript', 'React'],
    token: {
      address: 'solana-address-here',
      network: 'mainnet'
    }
    // All required fields included
  })
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    // Process successful response
    const data = result.data;
    // ...
  } else if (result.error.code === 'REQ_VALIDATION_ERROR') {
    // Handle validation errors
    const fieldErrors = result.error.details?.fields || {};
    
    // Display field-specific errors
    Object.entries(fieldErrors).forEach(([field, errorMsg]) => {
      console.error(`${field}: ${errorMsg}`);
      // Update UI to show field errors
    });
  } else {
    // Handle other errors
    console.error(`Error (${result.error.code}):`, result.error.message);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

## Endpoint-Specific Validation

Each endpoint in the v1 API has specific validation requirements. Refer to the endpoint-specific documentation for details on the required fields and validation rules for each endpoint.
