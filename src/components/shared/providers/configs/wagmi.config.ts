import { http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { WagmiProviderProps, createConfig } from 'wagmi'
import {} from 'wagmi/connectors'

export default {
	config: createConfig({
		chains: [baseSepolia],
		multiInjectedProviderDiscovery: false,
		syncConnectedChain: true,
		transports: {
			[baseSepolia.id]: http(
				'https://go.getblock.io/7d995bb47c0d4a419eaaae10e00295c4',
			),
		},
		ssr: true,
	}),
} satisfies WagmiProviderProps
