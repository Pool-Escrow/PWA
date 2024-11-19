import PageWrapper from '@/components/page-wrapper'
import AmountSection from './_components/amount-section'
import ProfileBalanceSection from './_components/balance-section'

export default function ProfileLayout() {
    return (
        <PageWrapper
            topBarProps={{
                backButton: true,
                title: 'Send',
            }}>
            <div className='flex flex-1 flex-col gap-3'>
                <ProfileBalanceSection />
                <AmountSection />
            </div>
        </PageWrapper>
    )
}
