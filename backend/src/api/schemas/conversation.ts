import { ValidationSchema, ValidationRules } from '../../middleware/validator.ts';

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
    rules: [ValidationRules.isString(), ValidationRules.isSolanaAddress()]
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
