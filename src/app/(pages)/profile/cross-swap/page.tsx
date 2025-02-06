import PageWrapper from '@/components/page-wrapper'
import ProfileBalanceSection from './_components/wallet-account-section'
import CrossSwapSection from './_components/cross-swap-section'
import WalletAccountSection from './_components/wallet-account-section'
import CrossChainSwapSection from './_components/cross-chain-swap-section'

export default function ProfileLayout() {
    return (
        <PageWrapper
            topBarProps={{
                backButton: true,
                title: 'swap',
            }}>
            <div className='flex flex-1 flex-col gap-3'>
                <WalletAccountSection />
                {/* <CrossSwapSection/>  // UN COMMENT THIS AND COMMENT `CrossChainSwapSection` TO ENABLE OKX WIDGET INSTEAD OF OKX API */}
                <CrossChainSwapSection />
            </div>
        </PageWrapper>
    )
}
