/**
 * Configuration for the rate limiter
 */
const CONFIG = {
    DEFAULT_LIMIT: 5,
    DEFAULT_WINDOW: 60_000, // 1 minute in milliseconds
    CLEANUP_INTERVAL: 300_000, // 5 minutes in milliseconds
    ENABLED: process.env.NODE_ENV === 'production', // Disabled by default in development
}

/**
 * Custom error class for rate limiting actions
 */
export class RateLimitError extends Error {
    constructor(message: string = 'Rate limit exceeded') {
        super(message)
        this.name = 'RateLimitError'
    }
}

/**
 * Interface for rate limit tracker
 */
interface RateTracker {
    requests: number[]
    windowStart: number
}

/**
 * Map to store rate limit trackers for each key
 */
const trackers = new Map<string, RateTracker>()

/**
 * Cleans up expired trackers
 */
function cleanupTrackers() {
    const now = Date.now()
    for (const [key, tracker] of trackers.entries()) {
        if (now - tracker.windowStart > CONFIG.DEFAULT_WINDOW) {
            trackers.delete(key)
        }
    }
}

// Set up periodic cleanup
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Enables the rate limiter
 */
export function enableRateLimiter(): void {
    CONFIG.ENABLED = true
    if (!cleanupInterval) {
        cleanupInterval = setInterval(cleanupTrackers, CONFIG.CLEANUP_INTERVAL)
    }
}

/**
 * Disables the rate limiter
 */
export function disableRateLimiter(): void {
    CONFIG.ENABLED = false
    if (cleanupInterval) {
        clearInterval(cleanupInterval)
        cleanupInterval = null
    }
}

/**
 * Implements sliding window rate limiting based on keys
 * @param key Unique identifier for the action or resource
 * @param limit Maximum number of requests allowed in the time window
 * @param windowMs Duration of the time window in milliseconds
 * @throws {RateLimitError} If the rate limit is exceeded
 */
export function rateLimitByKey(
    key: string,
    limit: number = CONFIG.DEFAULT_LIMIT,
    windowMs: number = CONFIG.DEFAULT_WINDOW,
): void {
    if (!CONFIG.ENABLED) return

    if (!key) throw new Error('Key is required')

    const now = Date.now()
    let tracker = trackers.get(key)

    if (!tracker) {
        tracker = { requests: [], windowStart: now }
        trackers.set(key, tracker)
    }

    // Remove expired requests
    tracker.requests = tracker.requests.filter(time => now - time < windowMs)

    // Slide the window if necessary
    if (now - tracker.windowStart > windowMs) {
        tracker.windowStart = now
    }

    // Check if limit is exceeded
    if (tracker.requests.length >= limit) {
        throw new RateLimitError()
    }

    // Add current request
    tracker.requests.push(now)
}

/**
 * Resets the rate limit for a specific key
 * @param key The key to reset
 */
export function resetRateLimit(key: string): void {
    trackers.delete(key)
}

/**
 * Gets the current rate limit status for a key
 * @param key The key to check
 * @returns An object with the current request count and remaining limit
 */
export function getRateLimitStatus(key: string): { count: number; remaining: number } {
    if (!CONFIG.ENABLED) {
        return { count: 0, remaining: Infinity }
    }

    const tracker = trackers.get(key)
    if (!tracker) {
        return { count: 0, remaining: CONFIG.DEFAULT_LIMIT }
    }

    const now = Date.now()
    const validRequests = tracker.requests.filter(time => now - time < CONFIG.DEFAULT_WINDOW)
    return {
        count: validRequests.length,
        remaining: Math.max(0, CONFIG.DEFAULT_LIMIT - validRequests.length),
    }
}

/**
 * Gets the current state of the rate limiter
 * @returns Whether the rate limiter is enabled or not
 */
export function isRateLimiterEnabled(): boolean {
    return CONFIG.ENABLED
}
