import type { PoolDetailsDTO } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import 'server-only'
import type { Address } from 'viem'
import type { ParticipantDetail } from '../../persistence/pools/blockchain/get-contract-participant-detail'
import getContractParticipantDetail from '../../persistence/pools/blockchain/get-contract-participant-detail'
import type { ContractPoolData } from '../../persistence/pools/blockchain/get-contract-pool'
import { getContractPool } from '../../persistence/pools/blockchain/get-contract-pool'
import getContractWinnerDetail from '../../persistence/pools/blockchain/get-contract-winner-detail'
import type { ParticipantsInfo } from '../../persistence/pools/db/get-db-participants-info'
import getDbParticipantsInfo from '../../persistence/pools/db/get-db-participants-info'
import type { PoolItem } from '../../persistence/pools/db/get-db-pool'
import { getDbPool } from '../../persistence/pools/db/get-db-pool'

function processPoolDetails(
    contractPool: ContractPoolData,
    poolInfo: PoolItem | null,
    participantsInfo: ParticipantsInfo,
    claimableAmount: bigint,
): PoolDetailsDTO {
    if (!poolInfo) {
        return {
            hostName: '',
            contractId: BigInt(contractPool.id),
            claimableAmount: Number(claimableAmount),
            participants: participantsInfo.participants.map((user: { name: string; avatarUrl: string }) => ({
                name: user.name,
                avatarUrl: user.avatarUrl,
            })),
            goal: Number(contractPool.poolBalance),
            progress: Number(contractPool.poolBalance),
            name: contractPool.name,
            startDate: contractPool.startDate,
            endDate: contractPool.endDate,
            numParticipants: participantsInfo.count,
            price: contractPool.price,
            tokenSymbol: contractPool.tokenSymbol,
            tokenDecimals: contractPool.tokenDecimals,
            status: contractPool.status,
            imageUrl: '/app/images/frog.png',
            winnerTitle: contractPool.status === POOLSTATUS.ENDED ? 'Winner' : undefined,
            softCap: 0,
            description: '',
            termsUrl: undefined,
            codeOfConductUrl: undefined,
            requiredAcceptance: false,
            poolBalance: Number(contractPool.poolBalance),
        }
    }
    return {
        hostName: poolInfo.hostName,
        contractId: BigInt(contractPool.id),
        claimableAmount: Number(claimableAmount) / 10 ** contractPool.tokenDecimals,
        participants: participantsInfo.participants.map((user: { name: string; avatarUrl: string }) => ({
            name: user.name,
            avatarUrl: user.avatarUrl,
        })),
        // userDeposit: Number(userInfo?.deposit) ?? 0,
        goal: poolInfo.softCap * contractPool.price || Number(contractPool.poolBalance),
        progress: Number(contractPool.poolBalance) / 10 ** contractPool.tokenDecimals,
        name: contractPool.name,
        startDate: contractPool.startDate,
        endDate: contractPool.endDate,
        numParticipants: participantsInfo.count,
        price: contractPool.price,
        tokenSymbol: contractPool.tokenSymbol,
        tokenDecimals: contractPool.tokenDecimals,
        status: contractPool.status,
        imageUrl: poolInfo.image,
        winnerTitle: contractPool.status === POOLSTATUS.ENDED ? 'Winner' : undefined,
        softCap: poolInfo.softCap,
        description: poolInfo.description,
        termsUrl: poolInfo.terms || undefined,
        codeOfConductUrl: poolInfo.codeOfConductUrl || undefined,
        requiredAcceptance: poolInfo.requiredAcceptance,
        poolBalance: Number(contractPool.poolBalance),
    }
}

export async function getPoolDetailsUseCase(poolId: string, userAddress?: string): Promise<PoolDetailsDTO> {
    const contractPool = await getContractPool(poolId)

    if (!contractPool) {
        throw new Error(`Pool with ID ${poolId} not found in contract`)
    }
    const [poolInfo, usersInfo] = await Promise.all([
        getDbPool(poolId),
        getDbParticipantsInfo(contractPool.participantAddresses),
    ])

    if (!poolInfo) {
        // TODO: Handle creation of pool in DB
        console.log('[getPoolDetails] Pool not found in database with id:', poolId)
    }

    let claimableAmount: bigint = BigInt(0)

    if (userAddress && contractPool.participantAddresses.includes(userAddress)) {
        if (contractPool.status === POOLSTATUS.ENDED) {
            const winnerDetail = (await getContractWinnerDetail(poolId, userAddress as Address)) || {
                amountWon: BigInt(0),
                amountClaimed: BigInt(0),
                forfeited: false,
            }
            claimableAmount = winnerDetail?.forfeited ? 0n : winnerDetail?.amountWon - winnerDetail?.amountClaimed
        }
    }

    return processPoolDetails(contractPool, poolInfo, usersInfo, claimableAmount)
}
