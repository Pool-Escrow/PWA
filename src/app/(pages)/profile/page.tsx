import Balance from '@/components/balance/balance'
import PageWrapper from '@/components/page-wrapper'
import UserDropdown from '@/components/user-dropdown'
import { DevChainSelector } from './_components/dev-chain-selector'
import { DeveloperModeSettings } from './_components/developer-mode-settings'
import UserInfo from './_components/user-info/user-info'
import { ClaimablePrizes } from './claim-winning/_components'

export default function ProfilePage() {
    return (
        <PageWrapper
            topBarProps={{
                backButton: true,
                title: 'User Profile',
                actionButton: <UserDropdown />,
            }}>
            <div className='space-y-[0.94rem] bg-white p-2'>
                <UserInfo />
                <Balance color='#5472E9' />
                <ClaimablePrizes />
                <DeveloperModeSettings />
                <DevChainSelector />
            </div>
        </PageWrapper>
    )
}
