// @ts-check

export const getCspDirectives = () => ({
    // Group related directives together
    // Security baseline
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'self'", 'data:'],

    // Script controls
    'script-src': [
        "'self'",
        "'unsafe-eval'", // Add comment explaining why needed
        "'unsafe-inline'", // Consider removing if possible
        'https://cdn.privy.io',
        'https://*.stripe.com',
        'https://challenges.cloudflare.com',
        'blob:',
    ],
    'script-src-elem': [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.privy.io',
        'https://*.stripe.com',
        'https://challenges.cloudflare.com',
    ],
    'worker-src': ["'self'", 'blob:'],

    // Resource loading
    'connect-src': [
        "'self'",
        'https://api.privy.io',
        'https://auth.privy.io',
        'wss://auth.privy.io',
        'https://*.supabase.co',
        'https://*.stripe.com',
        'https://*.coinbase.com',
        'https://mainnet.base.org',
        'https://sepolia.base.org',
        'https://base-mainnet.rpc.privy.systems',
        'https://explorer-api.walletconnect.com',
        'https://pulse.walletconnect.org',
        'https://chain-proxy.wallet.coinbase.com',
        'https://*.moonpay.com',
        'https://www.okx.com/api/v5/dex/cross-chain',
        'https://www.okx.com/api/',
        'https://www.okx.com/',
        // Add Web3Modal and WalletConnect APIs
        'https://api.web3modal.org',
        'https://*.web3modal.org',
        'https://rpc.walletconnect.com',
        'https://rpc.walletconnect.org',
        'https://*.walletconnect.com',
        'https://*.walletconnect.org',
        // Add additional blockchain RPC endpoints
        'https://base.gateway.tenderly.co',
        'https://base-sepolia.gateway.tenderly.co',
        'wss://base.gateway.tenderly.co',
        'wss://base-sepolia.gateway.tenderly.co',
        // Add public node endpoints
        'https://base.publicnode.com',
        'https://base-sepolia.publicnode.com',
        'https://base-rpc.publicnode.com',
        'https://base-sepolia-rpc.publicnode.com',
        'https://base.llamarpc.com',
    ],

    // Content restrictions
    'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.privy.io', 'https://fonts.googleapis.com'],
    'img-src': [
        "'self'",
        'blob:',
        'data:',
        'https://*.supabase.co',
        'https://explorer-api.walletconnect.com',
        'https://*.poolparty.cc',
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/*',
        'https://static.okx.com/cdn/web3/currency/token/*',
        'https://static.okx.com',
    ],
    'font-src': [
        "'self'",
        'https://cdn.privy.io',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'data:', // For base64 encoded fonts
    ],

    // Form/Frame controls
    'form-action': ["'self'"],
    'frame-src': ["'self'", 'https://app.privy.io', 'https://auth.privy.io', 'https://js.stripe.com'],

    // Other
    'upgrade-insecure-requests': [],
})

export const generateCspString = () => {
    const directives = getCspDirectives()
    return Object.entries(directives)
        .map(([key, values]) => {
            if (values.length === 0) return key
            return `${key} ${values.join(' ')}`
        })
        .join('; ')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContentSecurityPolicy = ({ dev = false, isStorybook = false }) => {
    const directives = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            'https://challenges.cloudflare.com',
            // Allow unsafe-inline for development speed, but should be removed in production if possible
            ...(dev || isStorybook ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
        ],
        'style-src': ["'self'", "'unsafe-inline'"], // unsafe-inline is needed for many UI libraries
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'child-src': ['https://auth.privy.io', 'https://verify.walletconnect.com', 'https://verify.walletconnect.org'],
        'frame-src': [
            'https://auth.privy.io',
            'https://verify.walletconnect.com',
            'https://verify.walletconnect.org',
            'https://challenges.cloudflare.com',
        ],
        'connect-src': [
            "'self'",
            'https://auth.privy.io',
            'wss://relay.walletconnect.com',
            'wss://relay.walletconnect.org',
            'wss://www.walletlink.org',
            'https://*.rpc.privy.systems',
            'https://explorer-api.walletconnect.com',
            // Allow connections for local development
            ...(dev ? ['ws://localhost:*', 'http://localhost:*', 'https://localhost:*'] : []),
        ],
        'worker-src': ["'self'"],
        'manifest-src': ["'self'"],
        ...(dev ? {} : { 'upgrade-insecure-requests': [] }),
    }

    return Object.entries(directives)
        .map(([directive, sources]) => {
            if (sources.length > 0) {
                return `${directive} ${sources.join(' ')}`
            }
            return directive
        })
        .join('; ')
}
