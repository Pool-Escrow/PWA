'use client'

import { config } from '@/constants/config'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { base, baseSepolia } from 'viem/chains'
import { WagmiProvider } from 'wagmi'

import { Toaster } from '@/components/ui/toaster'
import { chain } from '@/constants/constant'

export default function Providers({ children }: React.PropsWithChildren) {
	const queryClient = new QueryClient()

	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
			config={{
				loginMethods: ['email', 'wallet', 'farcaster'],
				appearance: {
					theme: 'light',
					accentColor: '#676FFF',
					logo: '/images/pool.png',
					showWalletLoginFirst: false,
				},
				embeddedWallets: {
					createOnLogin: 'users-without-wallets',
					noPromptOnSignature: true,
					priceDisplay: {
						primary: 'native-token',
						secondary: null,
					},
				},
				defaultChain: chain,
				supportedChains: [base, baseSepolia],
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
