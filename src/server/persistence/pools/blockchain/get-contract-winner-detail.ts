import 'server-only'

import { poolAbi } from '@/types/contracts'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import { currentPoolAddress, serverClient } from '../../../blockchain/server-config'

const GetWinnerDetail = getAbiItem({
    abi: poolAbi,
    name: 'getWinnerDetail',
})

export interface WinnerDetail {
    amountWon: string
    amountClaimed: string
    claimed: boolean
    forfeited: boolean
}

export default async function getContractWinnerDetail(
    poolId: string,
    winnerAddress: Address,
): Promise<WinnerDetail | null> {
    try {
        const winnerInfo = await serverClient?.readContract({
            address: currentPoolAddress,
            abi: [GetWinnerDetail],
            functionName: 'getWinnerDetail',
            args: [BigInt(poolId), winnerAddress],
        })

        if (!winnerInfo) {
            return null
        }

        const { amountWon, amountClaimed, claimed, forfeited } = winnerInfo

        return {
            amountWon: amountWon.toString(),
            amountClaimed: amountClaimed.toString(),
            claimed,
            forfeited,
        }
    } catch (error) {
        console.error('Error fetching winner details from contract:', error)
        return null
    }
}
