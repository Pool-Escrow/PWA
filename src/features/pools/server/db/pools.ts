import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { getUserAddressAction } from '@/app/(pages)/pools/actions'
import { getPoolInfo, getWinnerDetail } from '@/lib/contract/pool'
import { getTokenDecimals, getTokenSymbol } from '@/lib/contract/token'
import { fromUnixTime } from 'date-fns'
import { formatUnits } from 'viem'

export async function getPoolDetailsById({ queryKey: [, poolId] }: { queryKey: string[] }) {
    const address = await getUserAddressAction()
    const contractInfo = await getContractPoolInfo(poolId)

    if (!contractInfo) {
        // TODO: handle when the pool does not exist in the contract
        console.log('[getPoolDetailsById] Pool not found in contract with id:', poolId)
        return null
    }

    const [
        { data: poolInfo, error: poolError },
        { data: hostInfo, error: hostError },
        { data: usersInfo, error: usersError },
    ] = await Promise.all([getPool(poolId), getHostName(poolId), getParticipants(contractInfo.participants)])

    if (poolError) {
        // TODO: handle when the pool does not exist in the database
        console.log('[getPoolDetailsById] Pool not found in database with id:', poolId)
        return null
    }

    if (hostError) {
        // TODO: handle when the host does not exist in the database
        console.log('[getPoolDetailsById] Host not found in database with id:', poolId)
        return null
    }

    if (usersError) {
        // TODO: handle when the participants do not exist in the database
        console.log('[getPoolDetailsById] Participants not found in database with id:', poolId)
        return null
    }

    let claimableAmount: bigint = BigInt(0)

    if (address && contractInfo.participants.includes(address)) {
        if (contractInfo.status === POOLSTATUS.ENDED) {
            const winnerDetail = (await getWinnerDetail(poolId, address)) || {
                amountWon: BigInt(0),
                amountClaimed: BigInt(0),
                forfeited: false,
            }
            claimableAmount = winnerDetail?.forfeited ? 0n : winnerDetail?.amountWon - winnerDetail?.amountClaimed
        }
    }

    const price = Number(formatUnits(contractInfo.price, contractInfo.tokenDecimals))
    const balance = Number(formatUnits(contractInfo.balance, contractInfo.tokenDecimals))

    return {
        hostName: hostInfo.users?.displayName,
        contractId: poolId,
        claimableAmount: formatUnits(claimableAmount, contractInfo.tokenDecimals),

        participants: usersInfo.map(user => ({
            name: user.displayName || '',
            avatarUrl: user.avatar || '',
        })),
        goal: poolInfo.softCap * price || balance,
        // progress: balance,
        name: contractInfo.name,
        startDate: fromUnixTime(contractInfo.startDate),
        endDate: fromUnixTime(contractInfo.endDate),
        numParticipants: usersInfo.length,
        price,
        tokenSymbol: contractInfo.tokenSymbol,
        tokenDecimals: contractInfo.tokenDecimals,
        status: contractInfo.status,
        imageUrl: poolInfo.bannerImage,
        winnerTitle: contractInfo.status === POOLSTATUS.ENDED ? 'Winner' : undefined,
        softCap: poolInfo.softCap,
        description: poolInfo.description,
        termsUrl: poolInfo.termsURL || undefined,
        requiredAcceptance: poolInfo.required_acceptance,
        poolBalance: balance,
    }
}

export async function getContractPoolInfo(poolId: string) {
    const poolInfo = await getPoolInfo(poolId)

    if (poolInfo === undefined) {
        return null
    }

    // TODO: fetch host name from poolAdmin address instead of pool_participants
    const [poolAdmin, poolDetail, poolBalance, poolStatus, poolToken, participants] = poolInfo

    const tokenDecimals = await getTokenDecimals(poolToken)
    const tokenSymbol = await getTokenSymbol(poolToken)

    if (tokenDecimals === undefined || tokenSymbol === undefined) {
        return null
    }

    return {
        name: poolDetail.poolName,
        startDate: poolDetail.timeStart,
        endDate: poolDetail.timeEnd,
        price: poolDetail.depositAmountPerPerson,
        balance: poolBalance.balance,
        status: poolStatus,
        participants,
        tokenSymbol,
        tokenDecimals,
    }
}

const db = getSupabaseBrowserClient()

export async function getPool(poolId: string) {
    return db
        .from('pools')
        .select('termsURL, description, softCap, bannerImage, required_acceptance')
        .eq('contract_id', poolId)
        .single()
}

export async function getHostName(poolId: string) {
    return db
        .from('pool_participants')
        .select('users(displayName, walletAddress)')
        .eq('pool_id', poolId)
        .eq('poolRole', 'mainHost')
        .single()
}

export async function getParticipants(participantAddresses: readonly string[]) {
    return db.from('users').select('displayName, avatar, walletAddress').in('walletAddress', participantAddresses)
}
