import { ValidationSchema, ValidationRules } from '../../middleware/validator.ts';

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
    rules: [ValidationRules.isString(), ValidationRules.isSolanaAddress()]
  },
  username: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(16),
      ValidationRules.isValidName()
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
      ValidationRules.maxLength(16),
      ValidationRules.isValidName()
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
      ValidationRules.maxLength(16),
      ValidationRules.isValidName()
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
