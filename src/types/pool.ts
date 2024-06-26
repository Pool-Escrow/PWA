export interface PoolFormData {
    name: string
    description: string
    bannerImage: string
    termsURL: string
    softCap: number
    startDate: string
    endDate: string
    price: number
    tokenAddress: string
}

export interface ServerResponse {
    data?: PoolFormData
    errorMap?: {
        onServer?: string
    }
}

// TODO: Conflicts with the PoolStatus from global types
export type PoolStatus =
    | 'draft'
    | 'unconfirmed'
    | 'inactive'
    | 'depositsEnabled'
    | 'started'
    | 'paused'
    | 'ended'
    | 'deleted'

export interface PoolData {
    internal_id: string
    contract_id: string | null
    name: string
    description: string
    bannerImage: string | null
    termsURL: string
    softCap: number
    createdAt: string
    updatedAt: string
    startDate: string
    endDate: string
    price: number
    tokenAddress: string
    status: PoolStatus
}
