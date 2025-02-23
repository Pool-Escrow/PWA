import { cache } from 'react'
import type { APIResponse } from '../../types'
import { HttpClient } from '../api/http-client'
import { CONFIG } from '../config'
import { APIError, handleAPIError } from '../utils/errors'
import { sleep } from '../utils/sleep'

/**
 * Abstract base service class providing common functionality for API services
 * Includes retry mechanism and caching capabilities
 */
export abstract class BaseService {
    protected readonly client: HttpClient

    constructor() {
        this.client = HttpClient.getInstance()
    }

    /**
     * Makes a retryable request with built-in caching
     * @param {() => Promise<APIResponse<T>>} operation - The API operation to perform
     * @param {number} [maxRetries] - Maximum number of retry attempts
     * @returns {Promise<APIResponse<T>>} The API response
     * @throws {APIError} If all retry attempts fail
     */
    protected retryableRequest = cache(
        async <T>(
            operation: () => Promise<APIResponse<T>>,
            maxRetries = CONFIG.API.RETRY.MAX_ATTEMPTS,
        ): Promise<APIResponse<T>> => {
            let lastError: unknown

            for (let attempts = 0; attempts < maxRetries; attempts++) {
                try {
                    return await operation()
                } catch (error) {
                    lastError = error
                    if (attempts === maxRetries - 1) {
                        throw handleAPIError(error)
                    }
                    await sleep(CONFIG.API.RETRY.DELAY)
                }
            }

            throw new APIError('UNKNOWN', 'Max retries exceeded', lastError as number)
        },
    )
}
