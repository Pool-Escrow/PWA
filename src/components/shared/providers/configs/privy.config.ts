import { PrivyProviderProps } from '@privy-io/react-auth'
import { baseSepolia } from 'viem/chains'

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
	throw new Error('Missing NEXT_PUBLIC_PRIVY_APP_ID')
}

export default {
	appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
	config: {
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
		defaultChain: baseSepolia,
		supportedChains: [baseSepolia],
		legal: {
			privacyPolicyUrl: '/privacy',
			termsAndConditionsUrl: '/terms',
		},
		fiatOnRamp: { useSandbox: true },
	},
} satisfies Omit<PrivyProviderProps, 'children'>
