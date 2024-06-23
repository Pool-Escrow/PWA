import { poolAbi, poolAddress } from './contracts'

declare global {
    type LayoutWithSlots<T extends string> = {
        [K in T]: React.ReactNode
    }

    type ChainId = keyof typeof poolAddress

    type PoolFromContract = ContractFunctionReturnType<typeof poolAbi, 'view', 'getPoolDetail'> & {
        id: number
        tokenAddress: Address
    }

    type PoolFromDb = Omit<
        Database['public']['Tables']['pools']['Row'],
        'internal_id' | 'createdAt' | 'updatedAt' | 'status'
    >

    type PoolStatus = 'live' | 'upcoming' | 'past'

    type PoolFrontend = {
        id: number
        contract_id: number
        name: string
        tokenAddress: Address
        description: string
        bannerImage: string | null
        startDate: Date
        endDate: Date
    }
}

export {}
