import 'server-only'

import type { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { poolAbi, tokenAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'
import { erc20Abi, formatUnits, getAbiItem } from 'viem'
import { currentPoolAddress, serverConfig } from '../../../blockchain/server-config'

const publicClient = getPublicClient(serverConfig)

const GetAllPoolInfo = getAbiItem({
    abi: poolAbi,
    name: 'getAllPoolInfo',
})

export interface ContractPoolData {
    id: string
    name: string
    startDate: string
    endDate: string
    numParticipants: number
    status: POOLSTATUS
    price: number
    tokenSymbol: string
    tokenDecimals: number
    mainHost: Address
    participantAddresses: readonly string[]
    poolBalance: string
}

export async function getContractPool(poolId: string): Promise<ContractPoolData | null> {
    try {
        const poolInfo = await publicClient?.readContract({
            address: currentPoolAddress,
            abi: [GetAllPoolInfo],
            functionName: 'getAllPoolInfo',
            args: [BigInt(poolId)],
        })

        if (!poolInfo) {
            return null
        }

        const [poolAdmin, poolDetail, poolBalance, poolStatus, poolToken, participants] = poolInfo

        const tokenSymbol = await getTokenSymbol(poolToken)
        const tokenDecimals = await getTokenDecimals(poolToken)

        return {
            id: poolId,
            name: poolDetail.poolName,
            status: poolStatus,
            startDate: new Date(Number(poolDetail.timeStart) * 1000).toISOString(),
            endDate: new Date(Number(poolDetail.timeEnd) * 1000).toISOString(),
            numParticipants: participants.length,
            price: Number(poolDetail.depositAmountPerPerson) / 10 ** tokenDecimals,
            tokenSymbol,
            tokenDecimals,
            mainHost: poolAdmin.host,
            participantAddresses: participants,
            poolBalance: formatUnits(poolBalance.balance, tokenDecimals),
        }
    } catch (error) {
        console.error('Error fetching pool from contract:', error)
        return null
    }
}

async function getTokenSymbol(tokenAddress: Address): Promise<string> {
    const SymbolFunction = getAbiItem({
        abi: tokenAbi,
        name: 'symbol',
    })

    const tokenSymbol = await publicClient?.readContract({
        address: tokenAddress,
        abi: [SymbolFunction],
        functionName: 'symbol',
    })

    return tokenSymbol ?? ''
}

async function getTokenDecimals(tokenAddress: Address): Promise<number> {
    const DecimalsFunction = getAbiItem({
        abi: erc20Abi,
        name: 'decimals',
    })

    const tokenDecimals = await publicClient?.readContract({
        address: tokenAddress,
        abi: [DecimalsFunction],
        functionName: 'decimals',
    })

    return Number(tokenDecimals)
}
