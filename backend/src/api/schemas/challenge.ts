import { ValidationSchema, ValidationRules } from '../middleware/validator.ts';

/**
 * Schema for creating a new challenge
 */
export const createChallengeSchema: ValidationSchema = {
  name: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(50),
      ValidationRules.pattern(/^[a-zA-Z0-9-_]+$/, 'Must contain only letters, numbers, hyphens, and underscores')
    ]
  },
  title: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(5),
      ValidationRules.maxLength(100)
    ]
  },
  task: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(10)
    ]
  },
  system_message: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(10)
    ]
  },
  tools_description: {
    required: false,
    rules: [
      ValidationRules.isString()
    ]
  },
  custom_rules: {
    required: false,
    rules: [
      ValidationRules.isString()
    ]
  },
  expiry: {
    required: true,
    rules: [
      ValidationRules.isDate()
    ]
  },
  entryFee: {
    required: true,
    rules: [
      ValidationRules.isNumber(),
      ValidationRules.min(1)
    ]
  },
  characterLimit: {
    required: false,
    rules: [
      ValidationRules.isNumber(),
      ValidationRules.min(1),
      ValidationRules.max(10000)
    ]
  },
  contextLimit: {
    required: false,
    rules: [
      ValidationRules.isNumber(),
      ValidationRules.min(1),
      ValidationRules.max(20)
    ]
  },
  model: {
    required: false,
    rules: [
      ValidationRules.isString()
    ]
  },
  status: {
    required: false,
    rules: [
      ValidationRules.isString(),
      ValidationRules.isIn(['active', 'upcoming', 'concluded', 'draft'])
    ]
  }
};

/**
 * Schema for updating an existing challenge
 */
export const updateChallengeSchema: ValidationSchema = {
  title: {
    required: false,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(5),
      ValidationRules.maxLength(100)
    ]
  },
  task: {
    required: false,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(10)
    ]
  },
  system_message: {
    required: false,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(10)
    ]
  },
  tools_description: {
    required: false,
    rules: [
      ValidationRules.isString()
    ]
  },
  custom_rules: {
    required: false,
    rules: [
      ValidationRules.isString()
    ]
  },
  expiry: {
    required: false,
    rules: [
      ValidationRules.isDate()
    ]
  },
  entryFee: {
    required: false,
    rules: [
      ValidationRules.isNumber(),
      ValidationRules.min(1)
    ]
  },
  characterLimit: {
    required: false,
    rules: [
      ValidationRules.isNumber(),
      ValidationRules.min(1),
      ValidationRules.max(10000)
    ]
  },
  contextLimit: {
    required: false,
    rules: [
      ValidationRules.isNumber(),
      ValidationRules.min(1),
      ValidationRules.max(20)
    ]
  },
  model: {
    required: false,
    rules: [
      ValidationRules.isString()
    ]
  },
  status: {
    required: false,
    rules: [
      ValidationRules.isString(),
      ValidationRules.isIn(['active', 'upcoming', 'concluded', 'draft'])
    ]
  }
};

/**
 * Schema for getting a challenge by name
 */
export const getChallengeByNameSchema: ValidationSchema = {
  name: {
    required: true,
    rules: [
      ValidationRules.isString()
    ]
  }
};


export const getChallengesSchema: ValidationSchema = {
  status: {
      required: false,
      rules: [
        {
          validate: (value) => ['active', 'upcoming', 'concluded', 'draft'].includes(value),
          message: 'Status must be one of: active, upcoming, concluded, draft'
        }
      ]
    },
    limit: {
      required: false,
      rules: [
        {
          validate: (value) => {
            const num = parseInt(value);
            return !isNaN(num) && num > 0 && num <= 100;
          },
          message: 'Limit must be a number between 1 and 100'
        }
      ]
    },
    page: {
      required: false,
      rules: [
        {
          validate: (value) => {
            const num = parseInt(value);
            return !isNaN(num) && num > 0;
          },
          message: 'Page must be a positive number'
        }
      ]
    }
}