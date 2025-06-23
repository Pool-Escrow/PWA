import { useUserInfo } from '@/hooks/use-user-info'
import { useFundWallet } from '@privy-io/react-auth'
import { useState } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'

const MINIMUM_ONRAMP_AMOUNT = 35 // minimum for moonpay is $32.26

interface OnRampError {
    type: 'CHAIN_NOT_SUPPORTED' | 'GENERIC'
    message: string
    requiredChain?: typeof base | typeof baseSepolia
}

export function useOnRamp() {
    const { fundWallet } = useFundWallet()
    const { data: userInfo } = useUserInfo()
    const chainId = useChainId()
    const [error, setError] = useState<OnRampError | null>(null)

    const getRequiredChain = () => {
        // Determine the required chain based on environment or current chain
        const network = process.env.NEXT_PUBLIC_NETWORK || 'development'

        if (network === 'mainnet') {
            return base
        } else {
            return baseSepolia
        }
    }

    const handleOnRamp = async (amount?: number) => {
        const address = userInfo?.address
        const onrampAmount = amount ? Math.max(amount, MINIMUM_ONRAMP_AMOUNT) : MINIMUM_ONRAMP_AMOUNT
        const requiredChain = getRequiredChain()

        if (!address) {
            console.error('Cannot initiate onramp, user address not found')
            return false
        }

        // Clear previous errors
        setError(null)

        try {
            await fundWallet(address, {
                chain: requiredChain,
                amount: onrampAmount.toString(),
                config: {
                    currencyCode: requiredChain.id === base.id ? 'USDC_BASE' : 'USDC_BASE',
                    quoteCurrencyAmount: onrampAmount,
                    paymentMethod: 'credit_debit_card',
                    uiConfig: { accentColor: '#5472E9' },
                },
            })
            return true
        } catch (error) {
            console.error('Error initiating onramp:', error)

            // Check if it's the specific chain error
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (
                errorMessage.includes('Funding chain') &&
                errorMessage.includes('is not in PrivyProvider chains list')
            ) {
                setError({
                    type: 'CHAIN_NOT_SUPPORTED',
                    message: `Please switch to ${requiredChain.name} to use the deposit feature.`,
                    requiredChain,
                })
            } else {
                setError({
                    type: 'GENERIC',
                    message: 'Failed to initiate deposit. Please try again.',
                })
            }

            return false
        }
    }

    const clearError = () => {
        setError(null)
    }

    return {
        handleOnRamp,
        error,
        clearError,
        isChainSupported: chainId === base.id || chainId === baseSepolia.id,
        requiredChain: getRequiredChain(),
    }
}
