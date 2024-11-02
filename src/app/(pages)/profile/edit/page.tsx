import { getDbUser } from '@/app/_server/persistence/users/db/get-db-user'
import ProfileForm from './_components/profile-form'
import { privy, verifyToken } from '@/app/_server/auth/privy'
import { Tables } from '@/types/db'
import { Metadata } from 'next'
import PageWrapper from '@/components/page-wrapper'
import SkipButton from '@/components/skip-button'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type UserInfo = Pick<Tables<'users'>, 'avatar' | 'displayName'> | null

export default async function EditProfilePage({ searchParams }: { searchParams: { new?: string } }) {
    try {
        const user = await verifyToken()

        if (!user) {
            redirect('/pools')
        }
        const isNewProfile = searchParams.new !== undefined
        const title = isNewProfile ? 'Create a Profile' : 'Edit Profile'

        let userInfo: UserInfo = null
        if (!isNewProfile) {
            userInfo = await getDbUser(user.id)
        }

        return (
            <PageWrapper
                topBarProps={{
                    title,
                    actionButton: isNewProfile ? <SkipButton /> : null,
                    backButton: true,
                }}>
                <ProfileForm userInfo={userInfo} />
            </PageWrapper>
        )
    } catch (error) {
        console.error('Failed to load profile', error)
        redirect('/pools')
    }
}
