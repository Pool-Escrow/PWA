'use client'

import logo from '@/public/app/images/pool-logo-horizontal.png'
import type { PrivyProviderProps } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import type { Chain } from 'viem'
import { defaultChain, supportedChains } from './wagmi.config'

// Only log once in development
if (process.env.NODE_ENV === 'development' && !globalThis.__privyConfigLogged) {
    console.log('[privy-config] Imported chains from wagmi:', {
        chains: supportedChains.map((c: Chain) => ({ id: c.id, name: c.name })),
        defaultChain: { id: defaultChain.id, name: defaultChain.name },
        chainsLength: supportedChains.length,
    })
    globalThis.__privyConfigLogged = true
}

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error('Missing NEXT_PUBLIC_PRIVY_APP_ID')
}

const network = process.env.NEXT_PUBLIC_NETWORK || 'development'

// Configure Solana clusters based on the network environment
const getSolanaClusters = () => {
    if (network === 'mainnet') {
        return [{ name: 'mainnet-beta' as const, rpcUrl: 'https://api.mainnet-beta.solana.com' }]
    }
    return [{ name: 'devnet' as const, rpcUrl: 'https://api.devnet.solana.com' }]
}

export default {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    config: {
        appearance: {
            theme: 'light',
            accentColor: '#1364DA',
            logo: logo.src,
            landingHeader: 'Welcome to Pool Party',
            loginMessage: 'Pooling funds made simple and secure.',

            // Essential wallet configuration to prevent eth_requestAccounts errors
            walletChainType: 'ethereum-and-solana',
            // showWalletLoginFirst: false,
            // walletList: ['detected_wallets'],
        },

        externalWallets: {
            // coinbaseWallet: {
            //     connectionOptions: 'all',
            // },
            solana: {
                connectors: toSolanaWalletConnectors(),
            },
        },

        // Chain configuration - uses same chains as wagmi for consistency
        supportedChains: [...supportedChains], // Convert readonly array to mutable for Privy
        defaultChain: defaultChain,
        solanaClusters: getSolanaClusters(),

        // User onboarding
        // embeddedWallets: {
        // createOnLogin: 'users-without-wallets',
        // requireUserPasswordOnCreate: false,
        // showWalletUIs: true,
        // priceDisplay: {
        //     primary: 'native-token',
        //     secondary: null,
        // },
        // },

        // loginMethodsAndOrder: {
        // primary: ['email'],
        // overflow: ['detected_wallets'],
        // },

        legal: {
            privacyPolicyUrl: '/privacy-policy',
            termsAndConditionsUrl: '/terms',
        },

        mfa: {
            noPromptOnMfaRequired: false,
        },
    },
} satisfies Omit<PrivyProviderProps, 'children'>
