import { ValidationSchema, ValidationRules } from '../middleware/validator.ts';

/**
 * Schema for submitting a conversation message
 */
export const submitMessageSchema: ValidationSchema = {
  prompt: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  },
  signature: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(10)]
  },
  walletAddress: {
    required: true,
    rules: [
      ValidationRules.isString(),
      ValidationRules.pattern(
        /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
        'Must be a valid Solana wallet address'
      )
    ]
  }
};

/**
 * Schema for conversation ID parameter
 */
export const conversationIdSchema: ValidationSchema = {
  id: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};
