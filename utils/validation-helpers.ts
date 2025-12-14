/**
 * Validation helper functions
 * Common validation logic used across the application
 */

/**
 * Check if a value is empty (null, undefined, empty string, or whitespace)
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return false;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    if (isEmpty(email)) {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
    return value.trim().length >= minLength;
}

/**
 * Validate maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
    return value.trim().length <= maxLength;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    if (isEmpty(url)) {
        return false;
    }
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate that value contains only alphanumeric characters
 */
export function isAlphanumeric(value: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(value);
}

/**
 * Validate that value is a number
 */
export function isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && !isEmpty(value);
}

/**
 * Validate that value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Validate password strength
 * Returns an object with validation results
 */
export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
}

export function validatePassword(
    password: string,
    options: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumber?: boolean;
        requireSpecialChar?: boolean;
    } = {}
): PasswordValidation {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumber = true,
        requireSpecialChar = false,
    } = options;

    const errors: string[] = [];

    if (!hasMinLength(password, minLength)) {
        errors.push(`Password must be at least ${minLength} characters`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (requireNumber && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Sanitize string by removing HTML tags
 */
export function sanitizeHtml(value: string): string {
    return value.replace(/<[^>]*>/g, '');
}

/**
 * Validate that two values match (useful for password confirmation)
 */
export function valuesMatch(value1: any, value2: any): boolean {
    return value1 === value2;
}

/**
 * Create a required field validator
 */
export function required(fieldName: string = 'This field') {
    return (value: any): string | undefined => {
        return isEmpty(value) ? `${fieldName} is required` : undefined;
    };
}

/**
 * Create an email validator
 */
export function emailValidator(value: string): string | undefined {
    if (isEmpty(value)) {
        return undefined; // Use required() separately for required validation
    }
    return isValidEmail(value) ? undefined : 'Invalid email address';
}

/**
 * Create a min length validator
 */
export function minLength(min: number, fieldName: string = 'This field') {
    return (value: string): string | undefined => {
        if (isEmpty(value)) {
            return undefined; // Use required() separately for required validation
        }
        return hasMinLength(value, min)
            ? undefined
            : `${fieldName} must be at least ${min} characters`;
    };
}

/**
 * Create a max length validator
 */
export function maxLength(max: number, fieldName: string = 'This field') {
    return (value: string): string | undefined => {
        if (isEmpty(value)) {
            return undefined;
        }
        return hasMaxLength(value, max)
            ? undefined
            : `${fieldName} must be at most ${max} characters`;
    };
}

/**
 * Compose multiple validators
 */
export function composeValidators(
    ...validators: Array<(value: any) => string | undefined>
) {
    return (value: any): string | undefined => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) {
                return error;
            }
        }
        return undefined;
    };
}
