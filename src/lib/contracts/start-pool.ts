import { wagmi } from '@/providers/configs'
import { ConnectedWallet } from '@privy-io/react-auth'
import { getPublicClient } from '@wagmi/core'
import { initializeSmartAccount } from './initializeSmartAccount'

export const startPool = async ({ params }: { params: [string, ConnectedWallet[]] }) => {
    const publicClient = getPublicClient(wagmi.config)
    const [poolId, wallets] = params
    // const handleError = (message: string, error: Error) => {}
    // const acc = await useInitializeAccount(handleError)

    const smartAccount = await initializeSmartAccount(wallets[0])

    const poolDetail = await publicClient?.prepareTransactionRequest({
        // abi: poolAbi,
        // functionName: 'getAllPoolInfo',
        // address: poolAddress[publicClient.chain.id] as HexString,
        // args: [poolId],
    })

    return poolDetail
}
