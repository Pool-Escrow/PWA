import type { Address } from 'viem'

import { getAdminStatusAction } from '@/app/(pages)/pools/actions'
import ClientParticipantPayout from './_components/client-participant-payout'

async function ParticipantPayout({ params }: { params: { 'pool-id': string; 'participant-id': Address } }) {
    const isAdmin = await getAdminStatusAction()

    if (!isAdmin) {
        return <div className={'mt-4 w-full text-center'}>You are not authorized to create a payout.</div>
    }

    return <ClientParticipantPayout params={params} />
}

export default ParticipantPayout
