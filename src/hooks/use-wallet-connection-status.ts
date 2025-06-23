import { useWallets } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useWalletConnectionStatus() {
    const { wallets } = useWallets()
    const [isStable, setIsStable] = useState(true)
    const [lastConnectionCheck, setLastConnectionCheck] = useState(Date.now())

    useEffect(() => {
        const checkConnection = () => {
            const wallet = wallets[0]
            const now = Date.now()

            // Only check if it's been more than 5 seconds since last check
            if (now - lastConnectionCheck < 5000) return

            if (wallet && wallet.address && wallet.connectorType) {
                setIsStable(true)
            } else if (wallet && !wallet.connectorType) {
                // Wallet exists but connector is not available
                console.warn('🔌 [useWalletConnectionStatus] Wallet connector unavailable')
                setIsStable(false)

                // Show warning only once per 30 seconds to avoid spam
                if (now - lastConnectionCheck > 30000) {
                    toast.warning(
                        'Wallet connection seems unstable. If you experience issues, please refresh the page.',
                        {
                            action: {
                                label: 'Refresh',
                                onClick: () => window.location.reload(),
                            },
                            duration: 5000,
                        },
                    )
                }
            }

            setLastConnectionCheck(now)
        }

        // Check immediately
        checkConnection()

        // Check every 10 seconds
        const interval = setInterval(checkConnection, 10000)

        return () => clearInterval(interval)
    }, [wallets, lastConnectionCheck])

    return {
        isStable,
        hasWallet: Boolean(wallets[0]?.address),
        connectorType: wallets[0]?.connectorType,
    }
}
