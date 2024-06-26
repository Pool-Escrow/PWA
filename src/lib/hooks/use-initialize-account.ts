import { useWallets } from '@privy-io/react-auth'
import { useCallback } from 'react'
import { initializeSmartAccount } from '../contracts/initializeSmartAccount'

export const useInitializeAccount = (handleError: (message: string, error: Error) => void) => {
    const { wallets, ready } = useWallets()

    const initializeAccount = useCallback(async () => {
        if (!ready || !wallets.length) return

        const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
        if (embeddedWallet) {
            try {
                await initializeSmartAccount(embeddedWallet)
            } catch (error) {
                if (error instanceof Error) {
                    handleError('Failed to initialize smart account', error)
                } else {
                    throw error
                }
            }
        } else {
            // TODO: it can be the user just connected with EOA, handle that.
            handleError('Initialization error', new Error('Embedded wallet not found'))
        }
    }, [wallets, ready, handleError])

    return initializeAccount
}
