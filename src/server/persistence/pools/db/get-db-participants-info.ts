import 'server-only'
import { db } from '../../../database/db'

export interface ParticipantInfo {
    name: string
    avatarUrl: string
    walletAddress: string
}

export interface ParticipantsInfo {
    participants: ParticipantInfo[]
    count: number
}

export default async function getDbParticipantsInfo(
    participantAddresses: readonly string[],
): Promise<ParticipantsInfo> {
    const { data: participantsInfo, error } = await db
        .from('users')
        .select('displayName, avatar, walletAddress')
        .in('walletAddress', participantAddresses)

    if (error) {
        throw new Error(`Error getting participants info from database: ${error.message}`)
    }

    const participants: ParticipantInfo[] = participantsInfo.map(user => ({
        name: user.displayName || '',
        avatarUrl: user.avatar || '',
        walletAddress: user.walletAddress,
    }))

    return {
        participants,
        count: participants.length,
    }
}
