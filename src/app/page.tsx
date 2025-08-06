import { cookies } from 'next/headers'
import ActionBar from '@/components/layout/action-bar'
import { AppShell } from '@/components/layout/app-shell'
import Onboarding from '@/components/onboarding'
import PoolsList from '@/components/pools/pools-list'
// import { Button } from '@/components/ui/button'
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
        className: 'bg-transparent',
        rightContent: (
          <>
            <PrivacyButton />
            <UserAvatar />
          </>
        ),
      }}
      hero={(
        <div className="mb-6 flex flex-col gap-4">
          <UserBalances />
          <ActionBar />
        </div>
      )}
      // bottomCTA={
      // <Button className="w-full">Create Pool</Button>
      // }
    >
      <PoolsList />
    </AppShell>
  )
}
