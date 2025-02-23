/**
 * Utility functions for formatting and converting values
 */

/**
 * Formats a number as currency with specified decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Maximum number of decimal places (default: 6)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value: number, decimals = 6): string => {
    if (isNaN(value)) return '0.00'

    // For very small numbers, use scientific notation
    if (value < 0.000001) {
        return value.toExponential(2)
    }

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals,
        useGrouping: true,
    }).format(value)
}

/**
 * Formats seconds into a human-readable time string
 * @param {number} seconds - Number of seconds to format
 * @returns {string} Formatted time string (e.g., "2m 30s")
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
}

/**
 * Converts a whole number to its decimal representation
 * @param {number} amount - The amount to convert
 * @param {number} decimals - Number of decimal places
 * @returns {number} The amount in decimal representation
 */
export const toDecimals = (amount: number, decimals: number): number => {
    return amount * Math.pow(10, decimals)
}

/**
 * Converts a decimal number to its whole number representation
 * @param {number} amount - The amount to convert
 * @param {number} decimals - Number of decimal places
 * @returns {number} The amount in whole number representation
 */
export const toWholeNumber = (amount: number, decimals: number): number => {
    return amount / Math.pow(10, decimals)
}

/**
 * Converts a number to hexadecimal string with "0x" prefix
 * @param {number} value - The number to convert
 * @returns {string} Hexadecimal string representation
 */
export const toHex = (value: number | bigint): string => {
    return `0x${value.toString(16)}`
}

/**
 * Converts a chain ID to its hexadecimal representation
 * @param {string} chainId - The chain ID to convert
 * @returns {string} Hexadecimal string representation with "0x" prefix
 */
export const chainIdHex = (chainId: string): string => {
    return `0x${parseInt(chainId, 10).toString(16)}`
}
