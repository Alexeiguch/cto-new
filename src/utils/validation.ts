import Joi from 'joi';
import { ContractField } from '../types';

export const validateContractField = (field: ContractField): { isValid: boolean; error?: string } => {
  const fieldSchema = Joi.object({
    name: Joi.string().required(),
    value: Joi.any().required(),
    confidence: Joi.number().min(0).max(1).required(),
    source: Joi.string().valid('extraction', 'llm', 'manual').required(),
    validated: Joi.boolean().required(),
    required: Joi.boolean().required(),
  });

  const { error } = fieldSchema.validate(field);
  
  if (error) {
    return {
      isValid: false,
      error: error.details[0].message
    };
  }

  // Additional field-specific validation
  if (field.required && (!field.value || field.value === '')) {
    return {
      isValid: false,
      error: `${field.name} is required`
    };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})$/;
  return phoneRegex.test(phone);
};

export const validateCurrency = (amount: number): boolean => {
  return amount >= 0 && Number.isFinite(amount);
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};