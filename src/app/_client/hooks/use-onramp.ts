import { MoonpayConfig, useFundWallet } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'

export function useOnRamp() {
    const { fundWallet } = useFundWallet()
    const { address } = useAccount()
    const { ready } = usePrivy()

    const handleOnRamp = async (amount?: number) => {
        if (!ready) {
            console.log('Waiting for Privy to be ready...')
            return
        }

        if (!address) {
            console.error('Cannot initiate onramp, user address not found')
            return
        }

        // Limited to moonpay for now
        const fundWalletConfig: MoonpayConfig = {
            currencyCode: 'USDC_BASE',
            quoteCurrencyAmount: amount || 10, // Default amount if none provided
            paymentMethod: 'credit_debit_card',
            uiConfig: { accentColor: '#5472E9' },
        }

        try {
            await fundWallet(address, { config: fundWalletConfig })
            return true
        } catch (error) {
            console.error('Error initiating onramp:', error)
            return false
        }
    }

    return {
        handleOnRamp,
        isReady: ready,
        userAddress: address,
    }
}
