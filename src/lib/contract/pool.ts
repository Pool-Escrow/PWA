import { currentPoolAddress, serverConfig } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import { Address, getAbiItem } from 'viem'
import { Role } from './constants'

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
