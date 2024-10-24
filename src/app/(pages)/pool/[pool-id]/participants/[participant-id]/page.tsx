import { formatAddress } from '@/app/_lib/utils/addresses'
import frog from '@/public/app/images/frog.png'
import type { Address } from 'viem'
import { formatUnits, getAbiItem, parseUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTokenDecimals } from '@/app/(pages)/profile/send/_components/use-token-decimals'
import { usePoolDetails } from '../../ticket/_components/use-pool-details'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { useUserDetails } from '../_components/use-user-details'
import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getAdminStatusAction } from '@/app/(pages)/pools/actions'
import useTransactions from '@/app/_client/hooks/use-transactions'
import PayoutForm from './_components/payout-form'
import ClientParticipantPayout from './_components/client-participant-payout'

async function ParticipantPayout({ params }: { params: { 'pool-id': string; 'participant-id': Address } }) {
    const isAdmin = await getAdminStatusAction()

    if (!isAdmin) {
        return <div className={'mt-4 w-full text-center'}>You are not authorized to create a payout.</div>
    }

    return <ClientParticipantPayout params={params} />
}

export default ParticipantPayout
