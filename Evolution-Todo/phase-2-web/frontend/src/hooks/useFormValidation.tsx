'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';



interface UseFormValidationProps<T> {
  initialState: T;
  validations: {
    [K in keyof T]?: (value: T[K]) => string | null;
  };
}

const useFormValidation = <T extends Record<string, unknown>>({
  initialState,
  validations,
}: UseFormValidationProps<T>) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      const validator = validations[name];
      if (validator) {
        const error = validator(value);
        setErrors(prev => ({ ...prev, [name]: error || '' }));
      }
    },
    [validations]
  );

  const handleBlur = useCallback(
    <K extends keyof T>(name: K) => {
      setTouched(prev => ({ ...prev, [name]: true }));
      validateField(name, values[name]);
    },
    [values, validateField]
  );

  const handleChange = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    (Object.keys(validations) as (keyof T)[]).forEach(field => {
      const validator = validations[field];
      if (validator) {
        const error = validator(values[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      (Object.keys(validations) as (keyof T)[]).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>)
    );

    return Object.keys(newErrors).length === 0;
  }, [values, validations]);

  const AnimatedError = ({ name }: { name: string }) => {
    if (!errors[name] || !touched[name]) return null;

    return (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-destructive text-sm mt-1"
      >
        {errors[name]}
      </motion.p>
    );
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    isValid: Object.keys(errors).length === 0,
    AnimatedError,
  };
};

export { useFormValidation };