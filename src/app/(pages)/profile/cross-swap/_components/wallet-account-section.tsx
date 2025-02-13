'use client'

import UserInfo from '../../_components/user-info/user-info'

interface WalletAccountSectionProps {
    onHistoryClick?: () => void
    hasTransactions?: boolean
}

export default function WalletAccountSection({ onHistoryClick, hasTransactions }: WalletAccountSectionProps) {
    return (
        <div className='w-full p-1'>
            <UserInfo variant='cross-swap' onHistoryClick={onHistoryClick} hasTransactions={hasTransactions} />
        </div>
    )
}
