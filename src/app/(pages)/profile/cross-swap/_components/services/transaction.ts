import type { OKXAccountResponse, TransactionStatus } from '../../types'
import { CONFIG } from '../config'
import { APIError, handleAPIError } from '../utils/errors'
import { isNonEmptyArray, isValidTransactionStatus } from '../utils/validation'
import { BaseService } from './base-service'

/**
 * Service for handling transaction-related operations
 * Extends BaseService for retry and error handling capabilities
 */
export class TransactionService extends BaseService {
    /**
     * Retrieves the status of a transaction
     * @param {string} txnHash - The transaction hash
     * @returns {Promise<TransactionStatus>} The current status of the transaction
     * @throws {APIError} If the request fails or returns invalid data
     */
    async getStatus(txnHash: string): Promise<TransactionStatus> {
        const { path } = CONFIG.API.ENDPOINTS['status']
        const params = { hash: txnHash }

        try {
            const response = await this.retryableRequest<string[]>(() => this.client.get<string[]>(path, params))

            if (APIError.isInvalidError(response.code)) {
                return 'INVALID'
            }

            if (!isNonEmptyArray<string>(response.data)) {
                return 'INVALID'
            }

            const status = response.data[0]
            if (!isValidTransactionStatus(status)) {
                return 'INVALID'
            }

            return status as TransactionStatus
        } catch (error) {
            throw handleAPIError(error)
        }
    }

    /**
     * Retrieves OKX account information for a given address
     * @param {string} userAddress - The user's wallet address
     * @returns {Promise<OKXAccountResponse>} The account information
     * @throws {APIError} If the request fails
     */
    async getOKXAccount(userAddress: string): Promise<OKXAccountResponse> {
        const { path } = CONFIG.API.ENDPOINTS['accounts']
        const params = {
            addresses: [{ chainIndex: '1', address: userAddress }],
        }

        try {
            const response = await this.client.post<OKXAccountResponse>(path, params)
            return response.data
        } catch (error) {
            throw handleAPIError(error)
        }
    }
}
