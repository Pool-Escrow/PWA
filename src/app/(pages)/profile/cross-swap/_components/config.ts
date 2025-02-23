// Configuration
export const CONFIG = {
    API: {
        BASE_URL: 'https://www.okx.com',
        RETRY: { MAX_ATTEMPTS: 3, DELAY: 1000 },
        HEADERS: {
            'Content-Type': 'application/json',
            'OK-ACCESS-KEY': process.env.NEXT_PUBLIC_OKX_API_KEY,
            'OK-ACCESS-PASSPHRASE': process.env.NEXT_PUBLIC_OKX_PASSPHRASE,
            'OK-ACCESS-PROJECT': process.env.NEXT_PUBLIC_OKX_PROJECT_ID,
            'OK-ACCESS-SECRET': process.env.NEXT_PUBLIC_OKX_SECRET_KEY,
        },
        ENDPOINTS: {
            'tokenPairs/crosschain': { path: '/api/v5/dex/cross-chain/supported/bridge-tokens-pairs', call: 'GET' },
            'tokens': { path: '/api/v5/dex/cross-chain/supported/tokens', call: 'GET' },
            'tokens/all': { path: '/api/v5/dex/aggregator/all-tokens', call: 'GET' },
            'chains': { path: '/api/v5/dex/cross-chain/supported/chain', call: 'GET' },
            'route': { path: '/api/v5/dex/cross-chain/quote', call: 'GET' },
            'route/detailed': { path: '/priapi/v1/dx/trade/bridge/v3/quote', call: 'GET' },
            'approve': { path: '/api/v5/dex/aggregator/approve-transaction', call: 'GET' },
            'swap': { path: '/api/v5/dex/cross-chain/build-tx', call: 'GET' },
            'status': { path: '/api/v5/dex/cross-chain/status', call: 'GET' },
            'approval/status': { path: '/priapi/v1/dx/trade/multi/batchGetTokenApproveInfo', call: 'GET' },
            'history': { path: '/api/v5/wallet/post-transaction/transactions-by-address', call: 'GET' },
            'orders': { path: '/priapi/v1/dx/trade/multi/orders', call: 'GET' },
            'account/OKX': { path: '/api/v5/wallet/account/create-wallet-account', call: 'POST' },
            'accounts': { path: '/api/v5/wallet/account/accounts', call: 'GET' },
        },
    },
    CHAIN: {
        BASE: {
            chainId: '8453',
            chainName: 'Base',
            platformId: 11,
            routerAddress: '0x57df6092665eb6058DE53939612413ff4B09114E' as const,
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: '0x4200000000000000000000000000000000000006' as const,
            },
            tokens: {
                USDC: {
                    decimals: '6',
                    tokenContractAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
                    dexTokenApproveAddress: '0x57df6092665eb6058DE53939612413ff4B09114E',
                    tokenName: 'usdc',
                    tokenSymbol: 'USDC',
                    tokenLogoUrl:
                        'https://static.okx.com/cdn/web3/currency/token/784-0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC-1.png/type=default_350_0?v=1735272019523',
                },
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
        },
    },
} as const

// Tipos de ayuda para el CONFIG
export type ChainConfig = typeof CONFIG.CHAIN
export type APIConfig = typeof CONFIG.API
