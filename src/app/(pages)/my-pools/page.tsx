import PageWrapper from '@/components/page-wrapper'
import { getUserPools } from '@/features/pools/server/get-user-pools'
import { verifyToken } from '@/server/auth/privy'
import type { Address } from 'viem'
import RenderBottomBar from '../pools/_components/render-bottom-bar'
import MyPools from './_components/my-pools'

// Force dynamic rendering since this page uses authentication and cookies
export const dynamic = 'force-dynamic'

export default async function MyPoolsPage() {
    const user = await verifyToken().catch(() => null)
    const userAddress = user?.wallet?.address as Address | undefined

    // Fetch initial data on the server. If the user is not logged in, pass empty arrays.
    const [initialUpcomingPools, initialPastPools] = userAddress
        ? await Promise.all([getUserPools(userAddress, 'upcoming'), getUserPools(userAddress, 'past')])
        : [[], []]

    return (
        <PageWrapper topBarProps={{ backButton: true, title: 'My Pools' }}>
            <MyPools initialUpcomingPools={initialUpcomingPools} initialPastPools={initialPastPools} />
            <RenderBottomBar />
        </PageWrapper>
    )
}
