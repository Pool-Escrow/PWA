// API Routes
export const API_ROUTES = {
  USER_BALANCES: '/api/user-balances',
  USER_ROLES: '/api/user-roles',
  POOLS: '/api/pools',
  USER_PROFILE: '/api/user-profile',
  USER_COOKIES: '/api/user-cookies',
} as const

// Re-export token constants
export * from './tokens'

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  USER_BALANCES: (address?: App.Address) => ['user-balances', address] as const,
  USER_ROLES: (address?: App.Address) => ['user-roles', address] as const,
  USER_PROFILE: (address?: App.Address) => ['user-profile', address] as const,
  POOLS: ['pools'] as const,
  POOL: (id: string) => ['pool', id] as const,
  POOLS_UPCOMING: ['pools', 'upcoming'] as const,
  POOLS_USER: (address?: App.Address) => ['pools', 'user', address] as const,
  USER: (address?: App.Address, ready?: boolean) => ['user', address, ready] as const,
} as const

// Onboarding Steps
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Pool',
    description: 'Join pools, play games, and win prizes with friends!',
  },
  {
    id: 'connect-wallet',
    title: 'Connect Your Wallet',
    description: 'Securely connect your crypto wallet to get started.',
  },
  {
    id: 'join-pool',
    title: 'Join Your First Pool',
    description: 'Browse upcoming pools and join one that interests you.',
  },
] as const satisfies readonly {
  id: string
  title: string
  description: string
}[]

// Cookie Keys
export const COOKIE_KEYS = {
  ONBOARDING_COOKIE_KEY: 'onboarding-completed',
  PRIVACY_COOKIE_KEY: 'privacy-enabled',
} as const

// App Configuration
// APP_CONFIG commented out until we need it
// export const APP_CONFIG = {
//     MAX_POOLS_PER_USER: 5,
//     MIN_POOL_PARTICIPANTS: 2,
//     MAX_POOL_PARTICIPANTS: 500,
//     SUPPORTED_TOKENS: ['USDC', 'DROP'] as const,
// } as const
