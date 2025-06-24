import { getPoolAddressForChain, serverConfig } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import type { Role } from './constants'
import { getTokenDecimals, getTokenSymbol } from './token'

export function getPoolInfo(poolId: string, chainId?: number) {
    const client = getPublicClient(serverConfig, { chainId })
    const address = getPoolAddressForChain(chainId)

    if (!client || !address) return undefined

    return client.readContract({
        address,
        abi: [getAbiItem({ abi: poolAbi, name: 'getAllPoolInfo' })],
        functionName: 'getAllPoolInfo',
        args: [BigInt(poolId)],
    })
}

export function getWinnerDetail(poolId: string, winnerAddress: Address, chainId?: number) {
    const client = getPublicClient(serverConfig, { chainId })
    const address = getPoolAddressForChain(chainId)

    if (!client || !address) return undefined

    return client.readContract({
        address,
        abi: [getAbiItem({ abi: poolAbi, name: 'getWinnerDetail' })],
        functionName: 'getWinnerDetail',
        args: [BigInt(poolId), winnerAddress],
    })
}

export function hasRole(role: Role, address: Address, chainId?: number) {
    const client = getPublicClient(serverConfig, { chainId })
    const poolAddress = getPoolAddressForChain(chainId)

    if (!client || !poolAddress) return undefined

    return client.readContract({
        address: poolAddress,
        abi: [getAbiItem({ abi: poolAbi, name: 'hasRole' })],
        functionName: 'hasRole',
        args: [role, address],
    })
}

export async function getContractPoolInfo(poolId: string, chainId?: number) {
    const poolInfo = await getPoolInfo(poolId, chainId)

    if (poolInfo === undefined) {
        return null
    }

    const [_poolAdmin, poolDetail, poolBalance, poolStatus, poolToken, participants] = poolInfo

    const tokenDecimals = await getTokenDecimals(poolToken, chainId)
    const tokenSymbol = await getTokenSymbol(poolToken, chainId)

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
