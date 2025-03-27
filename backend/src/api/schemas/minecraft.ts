import { ValidationSchema, ValidationRules } from '../middleware/validator.ts';

/**
 * Schema for whitelist query parameters
 */
export const whitelistQuerySchema: ValidationSchema = {
  name: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};

/**
 * Schema for revealing server IP
 */
export const revealServerSchema: ValidationSchema = {
  address: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.pattern(
        /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
        'Must be a valid Solana wallet address'
      )
    ]
  },
  username: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(16),
      ValidationRules.pattern(
        /^[a-zA-Z0-9_]+$/,
        'Username must contain only letters, numbers, and underscores'
      )
    ]
  },
  signature: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(10)]
  },
  challengeName: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};

/**
 * Schema for rewarding a player
 */
export const rewardPlayerSchema: ValidationSchema = {
  username: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(16)
    ]
  },
  secret: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};

/**
 * Schema for chat messages
 */
export const chatMessageSchema: ValidationSchema = {
  username: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(16)
    ]
  },
  content: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  },
  secret: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};
