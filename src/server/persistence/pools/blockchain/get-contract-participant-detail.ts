import 'server-only'

import { currentPoolAddress, serverClient } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'

const GetParticipantDetail = getAbiItem({
    abi: poolAbi,
    name: 'getParticipantDetail',
})

export interface ParticipantDetail {
    deposit: string
    refunded: boolean
}

export default async function getContractParticipantDetail(
    poolId: string,
    participantAddress: string,
): Promise<ParticipantDetail | null> {
    try {
        // Validate the participantAddress
        if (!participantAddress || participantAddress === '0' || !participantAddress.startsWith('0x')) {
            console.error('Invalid participant address:', participantAddress)
            return null
        }

        const participantInfo = (await serverClient().readContract({
            address: currentPoolAddress,
            abi: [GetParticipantDetail],
            functionName: 'getParticipantDetail',
            args: [participantAddress as Address, BigInt(poolId)],
        })) as { deposit: bigint; refunded: boolean } | null

        if (!participantInfo) {
            return null
        }

        const { deposit, refunded } = participantInfo

        return {
            deposit: deposit.toString(),
            refunded,
        }
    } catch (error) {
        console.error('Error fetching participant details from contract:', error)
        return null
    }
}
