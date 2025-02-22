import { currentPoolAddress, serverConfig } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import type { Role } from './constants'
import { getTokenDecimals, getTokenSymbol } from './token'

const publicClient = getPublicClient(serverConfig)

export function getPoolInfo(poolId: string) {
    return publicClient?.readContract({
        address: currentPoolAddress,
        abi: [getAbiItem({ abi: poolAbi, name: 'getAllPoolInfo' })],
        functionName: 'getAllPoolInfo',
        args: [BigInt(poolId)],
    })
}

export function getWinnerDetail(poolId: string, winnerAddress: Address) {
    return publicClient?.readContract({
        address: currentPoolAddress,
        abi: [getAbiItem({ abi: poolAbi, name: 'getWinnerDetail' })],
        functionName: 'getWinnerDetail',
        args: [BigInt(poolId), winnerAddress],
    })
}

export function hasRole(role: Role, address: Address) {
    return publicClient?.readContract({
        address: currentPoolAddress,
        abi: [getAbiItem({ abi: poolAbi, name: 'hasRole' })],
        functionName: 'hasRole',
        args: [role, address],
    })
}

export async function getContractPoolInfo(poolId: string) {
    const poolInfo = await getPoolInfo(poolId)

    if (poolInfo === undefined) {
        return null
    }

    // TODO: fetch host name from poolAdmin address instead of pool_participants
    const [, /*poolAdmin*/ poolDetail, poolBalance, poolStatus, poolToken, participants] = poolInfo

    const tokenDecimals = await getTokenDecimals(poolToken)
    const tokenSymbol = await getTokenSymbol(poolToken)

    if (tokenDecimals === undefined || tokenSymbol === undefined) {
        return null
    }

    return {
        name: poolDetail.poolName,
        startDate: poolDetail.timeStart,
        endDate: poolDetail.timeEnd,
        price: poolDetail.depositAmountPerPerson.toString(),
        balance: poolBalance.balance.toString(),
        status: poolStatus,
        participants,
        tokenSymbol,
        tokenDecimals,
    }
}
