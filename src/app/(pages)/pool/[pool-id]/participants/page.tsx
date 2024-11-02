import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import Participants from './_components/participants'
import PageWrapper from '@/components/page-wrapper'
import { usePoolDetails } from '../ticket/_components/use-pool-details'

type Props = { params: { 'pool-id': string } }

export default async function ManageParticipantsPage({ params: { 'pool-id': poolId } }: Props) {
    const isAdmin = await getUserAdminStatusActionWithCookie()
    const { poolDetails } = usePoolDetails(poolId)

    return (
        <PageWrapper topBarProps={{ title: 'Participants', backButton: true }}>
            <Participants poolId={poolId} isAdmin={isAdmin} poolData={poolDetails} />
        </PageWrapper>
    )
}
