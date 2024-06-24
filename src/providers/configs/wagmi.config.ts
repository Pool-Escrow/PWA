import { http } from 'wagmi'
import type { Config, WagmiProviderProps } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { createConfig } from '@privy-io/wagmi'

const privyWagmiConfig: Config = createConfig({
    chains: [baseSepolia],
    multiInjectedProviderDiscovery: false,
    syncConnectedChain: true,
    transports: {
        [baseSepolia.id]: http(`https://base-sepolia.infura.io/v3/2ARoYAcrJ16OIvPpjJ7N8C6LqWX`),
    },
    ssr: true,
})

export default { config: privyWagmiConfig } satisfies WagmiProviderProps
