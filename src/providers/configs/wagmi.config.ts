import { http } from 'wagmi'
import type { Config, WagmiProviderProps } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { createConfig } from '@privy-io/wagmi'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const privyWagmiConfig: Config = createConfig({
    chains: [baseSepolia],
    multiInjectedProviderDiscovery: false,
    syncConnectedChain: true,
    transports: {
        [baseSepolia.id]: http('https://go.getblock.io/7d995bb47c0d4a419eaaae10e00295c4'),
    },
    ssr: true,
})

export default { config: privyWagmiConfig } satisfies WagmiProviderProps
