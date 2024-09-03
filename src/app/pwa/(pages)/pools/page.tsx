import Balance from '../../_components/balance/balance'
import AuthenticatedContent from './_components/authenticated-content'
import NextUserPool from './_components/next-user-pool'
import RenderBottomBar from './_components/render-bottom-bar'
import UpcomingPools from './_components/upcoming-pools'
import { checkAuthStatusAction } from './actions'

export default async function PoolsPage() {
    const [result] = await checkAuthStatusAction()
    console.log('PoolsPage result', result)
    const isAdmin = result && 'isAdmin' in result && result?.isAdmin

    return (
        <div className='space-y-6'>
            <Balance />
            <AuthenticatedContent
                isAdmin={isAdmin}
                nextUserPool={<NextUserPool />}
                renderBottomBar={<RenderBottomBar isAdmin={isAdmin} />}
            />
            <UpcomingPools />
        </div>
    )
}
