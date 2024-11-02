import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import CreatePoolForm from './create-pool-form'
import PageWrapper from '@/components/page-wrapper'
import UserMenu from '@/components/user-menu'

export default async function CreatePoolPage() {
    const isAdmin = await getUserAdminStatusActionWithCookie()

    if (!isAdmin) {
        return <div className={'mt-4 w-full text-center'}>You are not authorized to create a pool.</div>
    }

    return (
        <PageWrapper
            topBarProps={{
                title: 'Create Pool',
                backButton: true,
            }}>
            <CreatePoolForm />
        </PageWrapper>
    )
}
