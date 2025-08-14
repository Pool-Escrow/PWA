import { use } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import PrivacyButton from '@/components/user/privacy-button'
import UserDropdown from '@/components/user/user-dropdown'
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
            <UserDropdown />
          </>
        ),
      }}
    >
      <UserProfile address={address} />
    </AppShell>
  )
}
