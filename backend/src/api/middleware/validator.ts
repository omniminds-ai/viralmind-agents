import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/errors.ts';

/**
 * Type for validation rules
 */
export type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

/**
 * Type for field validation schema
 */
export type FieldValidation = {
  required?: boolean;
  rules?: ValidationRule[];
};

/**
 * Type for validation schema
 */
export type ValidationSchema = Record<string, FieldValidation>;

/**
 * Validation result type
 */
export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  isString: (): ValidationRule => ({
    validate: (value) => typeof value === 'string',
    message: 'Must be a string'
  }),

  isNumber: (): ValidationRule => ({
    validate: (value) => typeof value === 'number' && !isNaN(value),
    message: 'Must be a number'
  }),

  isBoolean: (): ValidationRule => ({
    validate: (value) => typeof value === 'boolean',
    message: 'Must be a boolean'
  }),

  isArray: (): ValidationRule => ({
    validate: (value) => Array.isArray(value),
    message: 'Must be an array'
  }),

  isObject: (): ValidationRule => ({
    validate: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
    message: 'Must be an object'
  }),

  isDate: (): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return value instanceof Date && !isNaN(value.getTime());
    },
    message: 'Must be a valid date'
  }),

  minLength: (min: number): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return value.length >= min;
    },
    message: `Must be at least ${min} characters long`
  }),

  maxLength: (max: number): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return value.length <= max;
    },
    message: `Must be at most ${max} characters long`
  }),

  min: (min: number): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'number') return false;
      return value >= min;
    },
    message: `Must be at least ${min}`
  }),

  max: (max: number): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'number') return false;
      return value <= max;
    },
    message: `Must be at most ${max}`
  }),

  pattern: (regex: RegExp, customMessage?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return regex.test(value);
    },
    message: customMessage || 'Invalid format'
  }),

  isIn: (values: any[], customMessage?: string): ValidationRule => ({
    validate: (value) => values.includes(value),
    message: customMessage || `Must be one of: ${values.join(', ')}`
  }),

  custom: (validateFn: (value: any) => boolean, message: string): ValidationRule => ({
    validate: validateFn,
    message
  })
};

/**
 * Validate an object against a schema
 */
export function validateObject(
  obj: Record<string, any>,
  schema: ValidationSchema
): ValidationResult {
  const errors: Record<string, string> = {};

  // Check each field in the schema
  for (const [field, validation] of Object.entries(schema)) {
    const value = obj[field];

    // Check if required field is missing
    if (validation.required && (value === undefined || value === null || value === '')) {
      errors[field] = 'This field is required';
      continue;
    }

    // Skip validation for undefined optional fields
    if (value === undefined) {
      continue;
    }

    // Apply validation rules
    if (validation.rules && value !== null) {
      for (const rule of validation.rules) {
        if (!rule.validate(value)) {
          errors[field] = rule.message;
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Middleware to validate request body
 */
export function validateBody(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { valid, errors } = validateObject(req.body, schema);

    if (!valid) {
      next(ApiError.validationError('Validation failed', { fields: errors }));
      return;
    }

    next();
  };
}

/**
 * Middleware to validate request query parameters
 */
export function validateQuery(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { valid, errors } = validateObject(req.query, schema);

    if (!valid) {
      next(ApiError.validationError('Query validation failed', { fields: errors }));
      return;
    }

    next();
  };
}

/**
 * Middleware to validate request parameters
 */
export function validateParams(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { valid, errors } = validateObject(req.params, schema);

    if (!valid) {
      next(ApiError.validationError('Parameter validation failed', { fields: errors }));
      return;
    }

    next();
  };
}
