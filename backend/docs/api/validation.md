# Request Validation

The API uses a robust validation system to ensure that all incoming requests contain valid data. This document outlines the validation approach used across the API endpoints.

## Validation Middleware

The API provides three main validation middleware functions:

1. `validateBody` - Validates the request body
2. `validateQuery` - Validates query parameters
3. `validateParams` - Validates route parameters

Each middleware takes a validation schema that defines the expected structure and rules for the request data.

## Validation Schema

A validation schema is an object that defines the expected fields and their validation rules:

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

The API provides a set of common validation rules that can be used in validation schemas:

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

When validation fails, the API returns a standardized error response:

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

## Example Validation Schema

```typescript
const userSchema = {
  name: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(2)]
  },
  email: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.pattern(/^.+@.+\..+$/, "Invalid email format")]
  },
  age: {
    required: false,
    rules: [ValidationRules.isNumber(), ValidationRules.min(18)]
  }
};

// Use in a route
router.post('/users', validateBody(userSchema), async (req, res) => {
  // Request body is guaranteed to be valid here
});
