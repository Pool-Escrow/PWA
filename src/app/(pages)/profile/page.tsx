'use client'

import Balance from '@/app/_components/balance/balance'
import UserInfo from './_components/user-info/user-info'
import { ClaimablePrizes } from './claim-winning/_components'
import UserDropdown from '@/components/user-dropdown'
import PageWrapper from '@/components/page-wrapper'

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
            </div>
        </PageWrapper>
    )
}
