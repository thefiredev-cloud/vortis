/**
 * Form Validation Library
 * Enterprise-grade form validation utilities
 */

export type ValidationRule<T = any> = {
  validate: (value: T) => boolean;
  message: string;
};

export type FieldValidation<T = any> = {
  rules: ValidationRule<T>[];
  value: T;
};

export type FormValidation<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type ValidationErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

// Common validation rules
export const validators = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message,
  }),

  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Allow empty (use required separately)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be ${max} characters or less`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (value === null || value === undefined) return true;
      return value >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (value === null || value === undefined) return true;
      return value <= max;
    },
    message: message || `Must be ${max} or less`,
  }),

  url: (message: string = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  phone: (message: string = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      return phoneRegex.test(value);
    },
    message,
  }),

  alphanumeric: (message: string = 'Only letters and numbers allowed'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      return alphanumericRegex.test(value);
    },
    message,
  }),

  custom: (
    validationFn: (value: any) => boolean,
    message: string
  ): ValidationRule => ({
    validate: validationFn,
    message,
  }),

  matches: (fieldName: string, message?: string): ValidationRule<any> => ({
    validate: (value, formData?: Record<string, any>) => {
      if (!formData) return true;
      return value === formData[fieldName];
    },
    message: message || `Must match ${fieldName}`,
  }),
};

/**
 * Validate a single field
 */
export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[] = [],
  formData?: Record<string, any>
): string | null {
  for (const rule of rules) {
    if (!rule.validate(value, formData)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate entire form
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  validationRules: FormValidation<T>
): { isValid: boolean; errors: ValidationErrors<T> } {
  const errors: ValidationErrors<T> = {};

  for (const field in validationRules) {
    const rules = validationRules[field];
    if (rules) {
      const error = validateField(formData[field], rules, formData);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * React Hook for form validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FormValidation<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Validate field on change if it's been touched
    if (touched[field]) {
      const rules = validationRules[field];
      if (rules) {
        const error = validateField(value, rules, values);
        setErrors((prev) => ({ ...prev, [field]: error || undefined }));
      }
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate field on blur
    const rules = validationRules[field];
    if (rules) {
      const error = validateField(values[field], rules, values);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const validateAll = (): boolean => {
    const { isValid, errors: validationErrors } = validateForm(values, validationRules);
    setErrors(validationErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    return isValid;
  };

  const reset = (newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({} as any);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  };
}

function useState<T>(arg0: T) {
  throw new Error('Function not implemented.');
}
