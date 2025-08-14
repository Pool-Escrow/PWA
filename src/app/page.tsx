import { cookies } from 'next/headers'
import ActionsBar from '@/components/layout/actions-bar'
import { AppShell } from '@/components/layout/app-shell'
import PageContent from '@/components/layout/page-content'
import Onboarding from '@/components/onboarding'
import PrivacyButton from '@/components/user/privacy-button'
import UserAvatar from '@/components/user/user-avatar'
import UserBalances from '@/components/user/user-balances'
import { COOKIE_KEYS } from '@/lib/constants'

export default async function Page() {
  const isOnboarded = (await cookies()).has(COOKIE_KEYS.ONBOARDING_COOKIE_KEY)

  if (!isOnboarded)
    return <Onboarding />

  return (
    <AppShell
      header={{
        rightContent: (
          <>
            <PrivacyButton />
            <UserAvatar />
          </>
        ),
      }}
      hero={(
        <>
          <UserBalances />
          <ActionsBar />
        </>
      )}
    >
      <PageContent />
    </AppShell>
  )
}
