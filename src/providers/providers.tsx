'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { cookieToInitialState } from 'wagmi'
import { AppStoreProvider } from './app-store.provider'
import privy from './configs/privy.config'
import { getConfig } from './configs/wagmi.config'
import ConfiguredQueryProvider from './query'

// -----------------------------------------------------------------------------
// Temporary console-warning filters
// -----------------------------------------------------------------------------
//
// We suppress six noisy warnings/errors originating from upstream libraries.
//
// 1. WalletConnect metadata.url mismatch (#walletconnect-monorepo/4581)
//    - Adds a trailing " /" so it differs from window.location.origin in dev.
// 2. "WalletConnect Core is already initialized."
//    - Triggered when Privy starts both Ethereum + Solana connectors.
// 3. "Lit is in dev mode." banner.
//    - Emitted once per session; harmless.
// 4. "Cannot redefine property: ethereum" from wallet extensions.
//    - Multiple browser wallet extensions compete to define window.ethereum.
// 5. "Wallet did not respond to eth_accounts" - Privy wallet initialization timing.
// 6. "Must call 'eth_requestAccounts'" - Privy wallet connection race condition.
//
// Remove this block when the issues are fixed upstream.
// -----------------------------------------------------------------------------

declare global {
    interface Window {
        litIssuedWarnings?: Set<string>
    }
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // 1 & 2 ▸ Patch console.warn to ignore specific messages
    const nativeWarn = console.warn
    const NOISY_WARNINGS = [
        "The configured WalletConnect 'metadata.url'",
        'WalletConnect Core is already initialized.',
        'Wallet did not respond to eth_accounts. Defaulting to prefetched accounts',
        "Must call 'eth_requestAccounts' before other methods",
        'Failed to fetch',
        'POST https://sepolia.base.org/ 403',
        'POST https://sepolia.base.org/ 429',
        'POST https://base-sepolia.infura.io',
        'POST https://base-sepolia-rpc.publicnode.com',
        'POST https://base-sepolia.gateway.tenderly.co',
        'RPC endpoint returned error',
        'Rate limit detected',
        'Transport created for',
    ] as const

    console.warn = (...args: unknown[]): void => {
        if (typeof args[0] === 'string' && NOISY_WARNINGS.some(msg => (args[0] as string).includes(msg))) {
            return
        }
        nativeWarn(...(args as Parameters<typeof console.warn>))
    }

    // Enhanced console.log suppression for development noise
    const nativeLog = console.log
    const NOISY_LOGS = [
        '[server-config] Transport created for',
        '[wagmi-config]',
        '[privy-config]',
        '[env.mjs]',
        'Transport created for',
        'Environment detection',
        'Configuration complete',
    ] as const

    console.log = (...args: unknown[]): void => {
        // Only suppress if NEXT_PUBLIC_VERBOSE_LOGS is not set to 'true'
        if (process.env.NEXT_PUBLIC_VERBOSE_LOGS !== 'true') {
            if (typeof args[0] === 'string' && NOISY_LOGS.some(msg => (args[0] as string).includes(msg))) {
                return
            }
        }
        nativeLog(...(args as Parameters<typeof console.log>))
    }

    // 3 ▸ Silence Lit's dev-mode banner
    window.litIssuedWarnings ??= new Set()
    window.litIssuedWarnings.add(
        'Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.',
    )

    // 4 ▸ Enhanced error suppression for wallet conflicts and RPC issues
    const nativeError = console.error
    console.error = (...args: unknown[]): void => {
        if (typeof args[0] === 'string') {
            const errorMessage = args[0]

            // Wallet extension conflicts
            if (errorMessage.includes('evmAsk.js') && errorMessage.includes('Cannot redefine property: ethereum')) {
                return
            }

            // RPC 403/429 errors (these are expected when endpoints are rate-limited)
            if (
                errorMessage.includes('POST https://sepolia.base.org/ 403') ||
                errorMessage.includes('POST https://sepolia.base.org/ 429') ||
                errorMessage.includes('POST https://mainnet.base.org/ 403') ||
                errorMessage.includes('POST https://mainnet.base.org/ 429') ||
                errorMessage.includes('POST https://base-sepolia.infura.io') ||
                errorMessage.includes('POST https://base-sepolia-rpc.publicnode.com') ||
                errorMessage.includes('POST https://base-sepolia.gateway.tenderly.co') ||
                (errorMessage.includes('Failed to fetch') && errorMessage.includes('sepolia.base.org')) ||
                (errorMessage.includes('Failed to fetch') && errorMessage.includes('mainnet.base.org')) ||
                (errorMessage.includes('Failed to fetch') && errorMessage.includes('base-sepolia')) ||
                (errorMessage.includes('Fetch failed loading') && errorMessage.includes('base-sepolia'))
            ) {
                return
            }

            // Suppress specific RPC timeout and connection errors
            if (
                errorMessage.includes('TimeoutError') ||
                errorMessage.includes('Request timed out') ||
                errorMessage.includes(
                    'response.errorInstance._errors_request_js__WEBPACK_IMPORTED_MODULE_3__.TimeoutError',
                ) ||
                (errorMessage.includes('POST') && errorMessage.includes('403 (Forbidden)')) ||
                (errorMessage.includes('POST') && errorMessage.includes('429')) ||
                errorMessage.includes('withTimeout.js') ||
                errorMessage.includes('withRetry.js') ||
                errorMessage.includes('fallback.js') ||
                errorMessage.includes('rankTransports')
            ) {
                return
            }

            // Suppress wallet extension timing issues
            if (
                errorMessage.includes("Must call 'eth_requestAccounts' before other methods") ||
                errorMessage.includes('Wallet did not respond to eth_accounts')
            ) {
                return
            }

            // Suppress Coinbase Wallet connection check errors
            if (
                errorMessage.includes('checkCrossOriginOpenerPolicy') ||
                errorMessage.includes('Failed to add embedded wallet connector') ||
                errorMessage.includes('createCoinbaseWalletSDK')
            ) {
                return
            }

            // Suppress Next.js navigation errors during auth flow
            if (
                errorMessage.includes('fetchServerResponse') ||
                errorMessage.includes('refreshReducer') ||
                errorMessage.includes('_rsc=')
            ) {
                return
            }
        }

        // For non-string errors or errors that don't match our suppression criteria
        nativeError(...args)
    }
}

type Props = {
    children: React.ReactNode
    cookie: string | null
}

const config = getConfig()

export default function Providers({ children, cookie }: Props) {
    const initialState = cookieToInitialState(config, cookie)

    return (
        <PrivyProvider {...privy}>
            <ConfiguredQueryProvider>
                <WagmiProvider config={config} initialState={initialState}>
                    <AppStoreProvider>{children}</AppStoreProvider>
                    <Toaster position='top-center' visibleToasts={1} />
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </WagmiProvider>
            </ConfiguredQueryProvider>
        </PrivyProvider>
    )
}
