import { ValidationSchema, ValidationRules } from '../../middleware/validator.ts';

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
      ValidationRules.isValidName()
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
    rules: [ValidationRules.isString(), ValidationRules.minLength(10)]
  },
  system_message: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(10)]
  },
  tools_description: {
    required: false,
    rules: [ValidationRules.isString()]
  },
  custom_rules: {
    required: false,
    rules: [ValidationRules.isString()]
  },
  expiry: {
    required: true,
    rules: [ValidationRules.isDate()]
  },
  entryFee: {
    required: true,
    rules: [ValidationRules.isNumber(), ValidationRules.min(1)]
  },
  characterLimit: {
    required: false,
    rules: [ValidationRules.isNumber(), ValidationRules.min(1), ValidationRules.max(10000)]
  },
  contextLimit: {
    required: false,
    rules: [ValidationRules.isNumber(), ValidationRules.min(1), ValidationRules.max(20)]
  },
  model: {
    required: false,
    rules: [ValidationRules.isString()]
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
    rules: [ValidationRules.isString(), ValidationRules.minLength(10)]
  },
  system_message: {
    required: false,
    rules: [ValidationRules.isString(), ValidationRules.minLength(10)]
  },
  tools_description: {
    required: false,
    rules: [ValidationRules.isString()]
  },
  custom_rules: {
    required: false,
    rules: [ValidationRules.isString()]
  },
  expiry: {
    required: false,
    rules: [ValidationRules.isDate()]
  },
  entryFee: {
    required: false,
    rules: [ValidationRules.isNumber(), ValidationRules.min(1)]
  },
  characterLimit: {
    required: false,
    rules: [ValidationRules.isNumber(), ValidationRules.min(1), ValidationRules.max(10000)]
  },
  contextLimit: {
    required: false,
    rules: [ValidationRules.isNumber(), ValidationRules.min(1), ValidationRules.max(20)]
  },
  model: {
    required: false,
    rules: [ValidationRules.isString()]
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
    rules: [ValidationRules.isString()]
  }
};

/**
 * Schema for listing challenges with filtering and pagination
 */
export const getChallengesSchema: ValidationSchema = {
  status: {
    required: false,
    rules: [
      ValidationRules.isIn(
        ['active', 'upcoming', 'concluded', 'draft'],
        'Status must be one of: active, upcoming, concluded, draft'
      )
    ]
  },
  limit: {
    required: false,
    rules: [ValidationRules.isQueryNumber(1, 100)]
  },
  page: {
    required: false,
    rules: [ValidationRules.isQueryNumber(1)]
  }
};
