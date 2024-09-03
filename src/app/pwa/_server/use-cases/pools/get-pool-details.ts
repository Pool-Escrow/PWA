import type { PoolDetailsDTO } from '@/app/pwa/(pages)/pool/[pool-id]/_lib/definitions'
import { POOLSTATUS } from '@/app/pwa/(pages)/pool/[pool-id]/_lib/definitions'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userInfo: ParticipantDetail | null,
): PoolDetailsDTO {
    if (!poolInfo) {
        //  TODO: Handle creation of pool in DB if not found
        // throw new Error(`Pool with ID ${contractPool.id} not found in database`)
        console.log('Pool not found in database with id:', contractPool.id)
        return {
            hostName: 'Unknown',
            contractId: BigInt(contractPool.id),
            claimableAmount: Number(claimableAmount),
            participants: participantsInfo.participants.map((user: { name: string; avatarUrl: string }) => ({
                name: user.name,
                avatarUrl: user.avatarUrl,
            })),
            // userDeposit: Number(userInfo?.deposit) ?? 0,
            goal: 0,
            progress: Number(contractPool.poolBalance) / 10 ** contractPool.tokenDecimals,
            name: contractPool.name,
            startDate: contractPool.startDate,
            endDate: contractPool.endDate,
            numParticipants: participantsInfo.count,
            price: contractPool.price,
            tokenSymbol: contractPool.tokenSymbol,
            tokenDecimals: contractPool.tokenDecimals,
            status: contractPool.status,
            imageUrl: 'Unknown',
            winnerTitle: contractPool.status === POOLSTATUS.ENDED ? 'Winner' : undefined,
            softCap: 0,
            description: 'Unknown',
            termsUrl: 'Unknown',
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
        goal:
            poolInfo.softCap * contractPool.price ||
            Number(contractPool.poolBalance) / 10 ** contractPool.tokenDecimals,
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
        poolBalance: Number(contractPool.poolBalance) / 10 ** contractPool.tokenDecimals,
    }
}

export async function getPoolDetailsUseCase(poolId: string, userAddress?: Address): Promise<PoolDetailsDTO> {
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
        console.log('Pool not found in database with id:', poolId)
        // throw new Error(`Pool with ID ${poolId} not found in database`)
    }

    let claimableAmount: bigint = BigInt(0)
    let userDeposit: ParticipantDetail | null = null

    if (userAddress && contractPool.participantAddresses.includes(userAddress)) {
        userDeposit = await getContractParticipantDetail(poolId, userAddress)

        if (contractPool.status === POOLSTATUS.ENDED) {
            const winnerDetail = (await getContractWinnerDetail(poolId, userAddress)) || {
                amountWon: BigInt(0),
                amountClaimed: BigInt(0),
                forfeited: false,
            }
            claimableAmount = winnerDetail?.forfeited ? 0n : winnerDetail?.amountWon - winnerDetail?.amountClaimed
        }
    }

    return processPoolDetails(contractPool, poolInfo, usersInfo, claimableAmount, userDeposit)
}
