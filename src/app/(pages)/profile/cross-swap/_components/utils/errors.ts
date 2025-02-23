/**
 * Custom error class for API-related errors
 * Provides structured error information and type checking capabilities
 */
export const ERROR_CODES = {
    TIMEOUT: '50011',
    INVALID: '51000',
    HTTP_ERROR: 'HTTP_ERROR',
    UNKNOWN: 'UNKNOWN',
} as const

export class APIError extends Error {
    /**
     * Creates a new APIError instance
     * @param {keyof typeof ERROR_CODES} code - The error code
     * @param {string} message - Error message
     * @param {number} [status] - HTTP status code if applicable
     * @param {Record<string, unknown>} [context] - Additional context for the error
     */
    constructor(
        public code: keyof typeof ERROR_CODES,
        message: string,
        public status?: number,
        public context?: Record<string, unknown>,
    ) {
        super(message)
        this.name = 'APIError'
    }

    /**
     * Checks if the error code indicates a timeout
     * @param {string} code - The error code to check
     * @returns {boolean} True if it's a timeout error
     */
    static isTimeoutError(code: string): boolean {
        return code === ERROR_CODES.TIMEOUT
    }

    /**
     * Checks if the error code indicates an invalid response
     * @param {string} code - The error code to check
     * @returns {boolean} True if it's an invalid error
     */
    static isInvalidError(code: string): boolean {
        return code === ERROR_CODES.INVALID
    }
}

/**
 * Handles unknown errors by converting them to APIError instances
 * @param {unknown} error - The error to handle
 * @returns {APIError} A properly typed APIError
 */
export function handleAPIError(error: unknown): APIError {
    if (error instanceof APIError) {
        return error
    }

    if (error instanceof Error) {
        return new APIError('UNKNOWN', error.message)
    }

    return new APIError('UNKNOWN', 'An unknown error occurred')
}
