import { dropletAddress, poolAddress } from '@/types/contracts'
import { createConfig, getPublicClient, http } from '@wagmi/core'
import type { Address } from 'viem'
import { baseSepolia } from 'viem/chains'

export const serverConfig = createConfig({
    chains: [baseSepolia],
    multiInjectedProviderDiscovery: false,
    syncConnectedChain: true,
    transports: {
        [baseSepolia.id]: http(process.env.RPC_ENDPOINT),
    },
    ssr: true,
})

export const currentPoolAddress: Address = poolAddress[serverConfig.state.chainId]
export const currentTokenAddress: Address = dropletAddress[serverConfig.state.chainId]

export const serverClient = getPublicClient(serverConfig)
