import { currentPoolAddress, serverClient } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'

const IsParticipant = getAbiItem({
    abi: poolAbi,
    name: 'isParticipant',
})

export async function verifyParticipantInContract(poolId: string, userAddress: string): Promise<boolean> {
    try {
        const isParticipant = await serverClient().readContract({
            address: currentPoolAddress,
            abi: [IsParticipant],
            functionName: 'isParticipant',
            args: [userAddress as Address, BigInt(poolId)],
        })

        return Boolean(isParticipant)
    } catch (error) {
        console.error('Error verifying participant in contract:', error)
        return false
    }
}
