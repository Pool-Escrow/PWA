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
        'blob:',
    ],
    'script-src-elem': ["'self'", "'unsafe-inline'", 'https://cdn.privy.io', 'https://*.stripe.com'],
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
        'https://www.okx.com/'
    ],

    // Content restrictions
    'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.privy.io'],
    'img-src': [
        "'self'",
        'blob:',
        'data:',
        'https://*.supabase.co',
        'https://explorer-api.walletconnect.com',
        'https://*.poolparty.cc',
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/*",
        "https://static.okx.com/cdn/web3/currency/token/*",
        "https://static.okx.com",
    ],
    'font-src': [
        "'self'",
        'https://cdn.privy.io',
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
