import type { PrivyProviderProps } from '@privy-io/react-auth'
import { baseSepolia } from 'viem/chains'

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error('Missing NEXT_PUBLIC_PRIVY_APP_ID')
}

export default {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    config: {
        appearance: {
            theme: 'light',
            accentColor: '#1364DA',
            logo: '/images/pool-logo-4x.png',
            landingHeader: 'Log in or sign up to continue',
            loginMessage: 'Pooling funds made simple.',
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
        externalWallets: {
            coinbaseWallet: {
                // Valid connection options include 'eoaOnly' (default), 'smartWalletOnly', or 'all'
                connectionOptions: 'smartWalletOnly',
            },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        legal: {
            privacyPolicyUrl: '/privacy-policy',
            termsAndConditionsUrl: '/terms',
        },
        loginMethodsAndOrder: {
            primary: ['email', 'sms', 'coinbase_wallet', 'detected_wallets'],
            overflow: [
                'wallet_connect',
                'farcaster',
                'telegram',
                'apple',
                'google',
                'twitter',
                'discord',
                'tiktok',
                'linkedin',
                'instagram',
            ],
        },
        fiatOnRamp: { useSandbox: true },
    },
} satisfies Omit<PrivyProviderProps, 'children'>
