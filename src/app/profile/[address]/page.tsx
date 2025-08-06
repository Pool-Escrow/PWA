import { use } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import PrivacyButton from '@/components/user/privacy-button'
import UserAvatar from '@/components/user/user-avatar'
import UserProfile from '@/components/user/user-profile'

interface ProfilePageProps {
  params: Promise<{ address: App.Address }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { address } = use(params)
  return (
    <AppShell
      header={{
        backButton: true,
        title: 'Profile',
        rightContent: (
          <>
            <PrivacyButton />
            <UserAvatar />
          </>
        ),
      }}
    >
      <UserProfile address={address} />
    </AppShell>
  )
}
