import { useState, useCallback, ChangeEvent } from 'react';

/**
 * Validation function type
 */
export type ValidationFn<T> = (values: T) => Partial<Record<keyof T, string>>;

/**
 * Form state interface
 */
export interface FormState<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isDirty: boolean;
}

/**
 * Form actions interface
 */
export interface FormActions<T> {
    handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    setFieldTouched: (field: keyof T, touched: boolean) => void;
    handleBlur: (field: keyof T) => () => void;
    handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
    resetForm: () => void;
    setValues: (values: Partial<T>) => void;
}

/**
 * Options for useFormState hook
 */
export interface UseFormStateOptions<T> {
    initialValues: T;
    validate?: ValidationFn<T>;
    onSubmit?: (values: T) => Promise<void> | void;
}

/**
 * Custom hook for managing form state with validation
 * 
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleSubmit } = useFormState({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors: any = {};
 *     if (!values.email) errors.email = 'Required';
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   }
 * });
 * ```
 */
export function useFormState<T extends Record<string, any>>({
    initialValues,
    validate,
    onSubmit,
}: UseFormStateOptions<T>): FormState<T> & FormActions<T> {
    const [values, setValuesState] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = useCallback(
        (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = e.target.value;
            setValuesState(prev => ({ ...prev, [field]: value }));
            setIsDirty(true);

            // Clear error when user starts typing
            if (errors[field]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        },
        [errors]
    );

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValuesState(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
        setTouched(prev => ({ ...prev, [field]: isTouched }));
    }, []);

    const handleBlur = useCallback(
        (field: keyof T) => () => {
            setTouched(prev => ({ ...prev, [field]: true }));

            // Validate on blur if validation function provided
            if (validate) {
                const validationErrors = validate(values);
                if (validationErrors[field]) {
                    setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
                }
            }
        },
        [validate, values]
    );

    const handleSubmit = useCallback(
        (submitFn: (values: T) => Promise<void> | void) =>
            async (e?: React.FormEvent) => {
                if (e) {
                    e.preventDefault();
                }

                // Mark all fields as touched
                const allTouched = Object.keys(values).reduce(
                    (acc, key) => ({ ...acc, [key]: true }),
                    {} as Record<keyof T, boolean>
                );
                setTouched(allTouched);

                // Validate
                if (validate) {
                    const validationErrors = validate(values);
                    setErrors(validationErrors);

                    // Don't submit if there are errors
                    if (Object.keys(validationErrors).length > 0) {
                        return;
                    }
                }

                // Submit
                setIsSubmitting(true);
                try {
                    await submitFn(values);
                } catch (error) {
                    console.error('Form submission error:', error);
                } finally {
                    setIsSubmitting(false);
                }
            },
        [values, validate]
    );

    const resetForm = useCallback(() => {
        setValuesState(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
        setIsDirty(false);
    }, [initialValues]);

    const setValues = useCallback((newValues: Partial<T>) => {
        setValuesState(prev => ({ ...prev, ...newValues }));
        setIsDirty(true);
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isDirty,
        handleChange,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        handleBlur,
        handleSubmit,
        resetForm,
        setValues,
    };
}
