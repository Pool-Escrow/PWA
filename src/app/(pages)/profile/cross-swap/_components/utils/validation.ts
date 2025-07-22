import type { TransactionStatus } from '../../types'

/**
 * Type guard to check if a value is a non-empty array
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
    return Array.isArray(value) && value.length > 0
}

/**
 * Type guard to validate transaction status
 * @param {unknown} status - The status to validate
 * @returns {boolean} True if the status is a valid TransactionStatus
 */
export function isValidTransactionStatus(status: unknown): status is TransactionStatus {
    return typeof status === 'string' && ['PENDING', 'COMPLETED', 'FAILED', 'INVALID'].includes(status)
}

/**
 * Validates if a string represents a valid non-negative amount
 * @param {string} amount - The amount to validate
 * @returns {boolean} True if the amount is valid
 */
export function isValidAmount(amount: string): boolean {
    if (!amount || amount.trim() === '') return false

    try {
        const value = BigInt(amount)
        return value >= 0n
    } catch {
        return false
    }
}

export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}
