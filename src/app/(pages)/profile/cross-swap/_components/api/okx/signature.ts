import crypto from "crypto"
import querystring from "querystring"
import { CONFIG } from "../../config"
import { APIError } from "../../utils/errors"

/**
 * OKX API signature generation utilities
 * Implements the OKX signature algorithm for API authentication
 */

/**
 * Generates a pre-hash string from request parameters
 * @param {string} timestamp - ISO timestamp
 * @param {'GET' | 'POST'} method - HTTP method
 * @param {string} requestPath - API endpoint path
 * @param {Record<string, unknown>} [params] - Request parameters
 * @returns {string} The pre-hash string
 */
export function preHash(
    timestamp: string,
    method: "GET" | "POST",
    requestPath: string,
    params?: Record<string, unknown> | null,
): string {
    let queryString = ""
    if (method === "GET" && params) {
        queryString = "?" + querystring.stringify(params as Record<string, string>)
    }
    if (method === "POST" && params) {
        queryString = JSON.stringify(params)
    }
    return timestamp + method + requestPath + queryString
}

/**
 * Signs a message using HMAC-SHA256
 * @param {string} message - The message to sign
 * @param {string} secretKey - The secret key for signing
 * @returns {string} The base64-encoded signature
 */
export function sign(message: string, secretKey: string): string {
    const hmac = crypto.createHmac("sha256", secretKey)
    hmac.update(message)
    return hmac.digest("base64")
}

/**
 * Creates a signature for an API request
 * @param {'GET' | 'POST'} method - HTTP method
 * @param {string} requestPath - API endpoint path
 * @param {Record<string, unknown>} [params] - Request parameters
 * @returns {{ signature: string; timestamp: string }} The signature and timestamp
 */
export function createSignature(
    method: "GET" | "POST",
    requestPath: string,
    params?: Record<string, unknown>,
): { signature: string; timestamp: string } {
    const timestamp = new Date().toISOString().slice(0, -5) + "Z"
    const message = preHash(timestamp, method, requestPath, params || null)
    const signature = sign(message, CONFIG.API.HEADERS["OK-ACCESS-SECRET"] || "")
    return { signature, timestamp }
}

/**
 * Creates headers for an API request
 * @param {string} signature - The request signature
 * @param {string} timestamp - The request timestamp
 * @returns {Record<string, string>} The headers object
 * @throws {APIError} If required configuration is missing
 */
export function createHeaders(signature: string, timestamp: string): Record<string, string> {
    if (
        !CONFIG.API.HEADERS["OK-ACCESS-KEY"] ||
        !CONFIG.API.HEADERS["OK-ACCESS-PASSPHRASE"] ||
        !CONFIG.API.HEADERS["OK-ACCESS-PROJECT"]
    ) {
        throw new APIError("UNKNOWN", "Missing required API configuration")
    }

    return {
        "Content-Type": "application/json",
        "OK-ACCESS-KEY": CONFIG.API.HEADERS["OK-ACCESS-KEY"],
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": CONFIG.API.HEADERS["OK-ACCESS-PASSPHRASE"],
        "OK-ACCESS-PROJECT": CONFIG.API.HEADERS["OK-ACCESS-PROJECT"],
    }
}
