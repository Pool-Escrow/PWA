import { getAuthStatus } from '@/app/pwa/_server/auth/auth.action'
import CreatePoolForm from './create-pool-form'
import { cn } from '@/lib/utils/tailwind'

export default async function CreatePoolPage() {
    const authStatus = await getAuthStatus()
    const isAuthorized = authStatus.isAuthenticated && authStatus.isAdmin

    if (!isAuthorized) {
        return <div className={cn('mt-4 w-full text-center')}>You are not authorized to create a pool.</div>
    }

    return <CreatePoolForm />
}
