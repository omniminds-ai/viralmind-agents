import { ValidationSchema, ValidationRules } from '../../middleware/validator.ts';

/**
 * Schema for challenge-chat stream query parameters
 */
export const challengeChatStreamSchema: ValidationSchema = {
  name: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};

/**
 * Schema for race data stream parameters
 */
export const raceDataStreamParamsSchema: ValidationSchema = {
  stream: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};

/**
 * Schema for race data stream query parameters
 */
export const raceDataStreamQuerySchema: ValidationSchema = {
  secret: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};

/**
 * Schema for race data stream body
 */
export const raceDataStreamBodySchema: ValidationSchema = {
  data: {
    required: true,
    rules: [ValidationRules.isObject()]
  },
  type: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  },
  platform: {
    required: true,
    rules: [ValidationRules.isString(), ValidationRules.minLength(1)]
  }
};
