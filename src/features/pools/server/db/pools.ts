import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { getUserAddressAction } from '@/app/(pages)/pools/actions'
import { getPoolInfo, getWinnerDetail } from '@/lib/contract/pool'
import { getTokenDecimals, getTokenSymbol } from '@/lib/contract/token'
import { getPoolDateOverride } from '@/lib/utils/get-pool-date-override'
import { fromUnixTime } from 'date-fns'
import type { Address } from 'viem'
import { formatUnits } from 'viem'
import { z } from 'zod'

const PoolDetailsSchema = z.object({
    hostName: z.string().nullable(),
    contractId: z.string(),
    claimableAmount: z.string(),
    participants: z.array(
        z.object({
            name: z.string(),
            avatarUrl: z.string(),
            address: z.string(),
        }),
    ),
    goal: z.number(),
    name: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    numParticipants: z.number(),
    price: z.number(),
    tokenSymbol: z.string(),
    tokenDecimals: z.number(),
    status: z.number(),
    imageUrl: z.string().nullable(),
    winnerTitle: z.string().optional(),
    softCap: z.number().nullable(),
    description: z.string().nullable(),
    termsUrl: z.string().optional(),
    requiredAcceptance: z.boolean().nullable(),
    poolBalance: z.number(),
})

// type PoolDetails = z.infer<typeof PoolDetailsSchema>

export async function getPoolDetailsById({ queryKey: [, poolId], chainId }: { queryKey: string[]; chainId?: number }) {
    // -------------------------------------------------------------------------------------
    // Avoid invoking a Server Action from the browser. When this function is executed on
    // the client (e.g. React-Query prefetch on hover) calling a `use server` action would
    // issue an extra POST request to `/` which is both wasteful and noisy in the logs.
    // We therefore only call `getUserAddressAction` when the code is running on the
    // server. On the client we fall back to `undefined` (claimableAmount will be "0").
    // -------------------------------------------------------------------------------------

    let address: Address | undefined

    if (typeof window === 'undefined') {
        address = await getUserAddressAction()
    }

    const contractInfo = await getContractPoolInfo(poolId, chainId)

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

    let claimableAmount = '0'
    if (address && contractInfo.participants.includes(address)) {
        if ((contractInfo.status as POOLSTATUS) === POOLSTATUS.ENDED) {
            const winnerDetail = (await getWinnerDetail(poolId, address, chainId)) || {
                amountWon: BigInt(0),
                amountClaimed: BigInt(0),
                forfeited: false,
            }
            const claimableAmountBigInt = winnerDetail?.forfeited
                ? BigInt(0)
                : winnerDetail.amountWon - winnerDetail.amountClaimed

            claimableAmount = formatUnits(claimableAmountBigInt, contractInfo.tokenDecimals)
        }
    }

    const price = Number(formatUnits(BigInt(contractInfo.price), contractInfo.tokenDecimals))
    const balance = Number(formatUnits(BigInt(contractInfo.balance), contractInfo.tokenDecimals))

    const dateOverride = getPoolDateOverride(poolId)
    const poolStartDate = fromUnixTime(dateOverride?.startDate ?? contractInfo.startDate)
    const poolEndDate = fromUnixTime(dateOverride?.endDate ?? contractInfo.endDate)

    const poolDetails = {
        hostName: hostInfo.users?.displayName,
        contractId: poolId,
        claimableAmount,
        participants: usersInfo.map(user => ({
            name: user.displayName || '',
            avatarUrl: user.avatar || '',
            address: user.walletAddress as Address,
        })),
        goal: poolInfo.softCap * price || balance,
        name: contractInfo.name,
        startDate: poolStartDate,
        endDate: poolEndDate,
        numParticipants: usersInfo.length,
        price,
        tokenSymbol: contractInfo.tokenSymbol,
        tokenDecimals: contractInfo.tokenDecimals,
        status: contractInfo.status as POOLSTATUS,
        imageUrl: poolInfo.bannerImage,
        winnerTitle: (contractInfo.status as POOLSTATUS) === POOLSTATUS.ENDED ? 'Winner' : undefined,
        softCap: poolInfo.softCap,
        description: poolInfo.description,
        termsUrl: poolInfo.termsURL || undefined,
        requiredAcceptance: poolInfo.required_acceptance,
        poolBalance: balance,
    }

    try {
        return PoolDetailsSchema.parse(poolDetails)
    } catch (error) {
        console.error('Validation error:', error)
        throw error
    }
}

export async function getContractPoolInfo(poolId: string, chainId?: number) {
    const poolInfo = await getPoolInfo(poolId, chainId)

    if (poolInfo === undefined) {
        return null
    }

    // TODO: fetch host name from poolAdmin address instead of pool_participants
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
