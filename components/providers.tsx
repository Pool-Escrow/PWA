'use client'

import { ThemeProvider } from 'next-themes'
import { PrivyProvider } from '@privy-io/react-auth'
import { base, baseSepolia } from 'viem/chains'
import { chain } from 'constants/constant'
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/constants/config'

import { Toaster } from '@/components/ui/toaster'

export default function Providers({ children }: React.PropsWithChildren) {
	// const configureChainsConfig = createConfig({
	// 	chains: [mainnet, goerli, foundry],
	// 	transports: {
	// 		[foundry.id]: http(),
	// 		[sepolia.id]: http(),
	// 	},
	// })

	const queryClient = new QueryClient()

	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
			config={{
				loginMethods: [
					// 'google',
					'wallet',
					// 'farcaster',
				],
				appearance: {
					theme: 'light',
					accentColor: '#676FFF',
					logo: '/images/pool.png',
					// showWalletLoginFirst: false,
				},
				embeddedWallets: {
					createOnLogin: 'off',
					// createOnLogin: 'users-without-wallets',
					priceDisplay: {
						primary: 'native-token',
						secondary: null,
					},
				},

				defaultChain: chain,
				supportedChains: [
					base,
					baseSepolia,
					// baseGoerli,
					// mainnet,
					// goerli,
					// chain,
				],
				legal: {
					privacyPolicyUrl: '/privacy',
					termsAndConditionsUrl: '/terms',
				},
				fiatOnRamp: { useSandbox: true },
			}}
		>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={config}>
					<ThemeProvider
						attribute='class'
						defaultTheme='system'
						disableTransitionOnChange
					>
						{children}
						<Toaster />
					</ThemeProvider>
				</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	)
}
