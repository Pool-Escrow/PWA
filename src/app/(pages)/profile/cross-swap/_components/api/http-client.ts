import type { APIResponse } from '../../types'
import { CONFIG } from '../config'
import { APIError } from '../utils/errors'
import { createHeaders, createSignature } from './okx/signature'

/**
 * HTTP Client for making API requests with retry and error handling capabilities.
 * Implements the Singleton pattern to ensure only one instance exists.
 */
export class HttpClient {
    private static instance: HttpClient

    private constructor() {}

    /**
     * Gets the singleton instance of HttpClient
     * @returns {HttpClient} The singleton instance
     */
    static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient()
        }
        return HttpClient.instance
    }

    private cache = new Map<
        string,
        {
            data: unknown
            timestamp: number
        }
    >()

    private getCacheKey(method: string, url: string, body?: Record<string, unknown>): string {
        return `${method}:${url}:${body ? JSON.stringify(body) : ''}`
    }

    private isCacheValid(timestamp: number): boolean {
        const CACHE_DURATION = 60 * 1000 // 60 seconds
        return Date.now() - timestamp < CACHE_DURATION
    }

    /**
     * Performs a GET request
     * @param {string} path - The API endpoint path
     * @param {Record<string, unknown>} [params] - Optional query parameters
     * @returns {Promise<APIResponse<T>>} The API response
     */
    async get<T>(path: string, params?: Record<string, unknown>): Promise<APIResponse<T>> {
        const { signature, timestamp } = createSignature('GET', path, params)
        const headers = createHeaders(signature, timestamp)
        const url = this.buildUrl(path, params)
        return this.request<T>('GET', url, null, headers)
    }

    /**
     * Performs a POST request
     * @param {string} path - The API endpoint path
     * @param {Record<string, unknown>} [body] - Optional request body
     * @returns {Promise<APIResponse<T>>} The API response
     */
    async post<T>(path: string, body?: Record<string, unknown>): Promise<APIResponse<T>> {
        const { signature, timestamp } = createSignature('POST', path, body)
        const headers = createHeaders(signature, timestamp)
        const url = `${CONFIG.API.BASE_URL}${path}`

        return this.request<T>('POST', url, body, headers)
    }

    private async request<T>(
        method: string,
        url: string,
        body?: Record<string, unknown> | null,
        headers?: HeadersInit,
    ): Promise<APIResponse<T>> {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            cache: 'no-store', // Next.js 15 way to handle dynamic data
        })
        if (!response.ok) {
            throw new APIError('HTTP_ERROR', `HTTP request failed with status: ${response.status}`, response.status)
        }

        const data = (await response.json()) as unknown

        if (!this.isValidResponse<T>(data)) {
            throw new APIError('UNKNOWN', 'Invalid API response format')
        }

        return data
    }

    private buildUrl(path: string, params?: Record<string, unknown>): string {
        const url = new URL(CONFIG.API.BASE_URL + path)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        if (url.searchParams.values().find(x => x === v)) return
                        url.searchParams.append(key, String(v))
                    })
                    return
                }
                url.searchParams.append(key, String(value))
            })
        }
        return url.toString()
    }

    private isValidResponse<T>(response: unknown): response is APIResponse<T> {
        if (typeof response !== 'object' || response === null) return false
        const apiResponse = response as Partial<APIResponse<T>>
        return typeof apiResponse.code === 'string' && 'data' in apiResponse && apiResponse.data !== undefined
    }
}
