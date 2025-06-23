import { env, getServerEnv } from '@/env.mjs'
import type { Database } from '@/types/db'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

/**
 * Get Supabase configuration for client-side usage (browser)
 * Only includes public environment variables
 */
export function getSupabaseClientConfig() {
    const network = env.NEXT_PUBLIC_NETWORK

    let supabaseUrl: string | undefined
    let supabaseAnonKey: string | undefined

    switch (network) {
        case 'mainnet':
            // Production Supabase instance for mainnet
            supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL_MAINNET || env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MAINNET || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            break
        case 'testnet':
        case 'development':
        default:
            // Development Supabase instance for testnet/development
            supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL_TESTNET || env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TESTNET || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            break
    }

    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log('[supabase] Client configuration:', {
            network: env.NEXT_PUBLIC_NETWORK,
            supabaseUrl: supabaseUrl.substring(0, 30) + '...',
            hasAnonKey: !!supabaseAnonKey,
        })
    }

    return { supabaseUrl, supabaseAnonKey }
}

/**
 * Get Supabase configuration for server-side usage
 * Includes both public and server-only environment variables
 */
export function getSupabaseServerConfig() {
    const network = env.NEXT_PUBLIC_NETWORK
    const serverEnv = getServerEnv()

    let supabaseUrl: string | undefined
    let supabaseAnonKey: string | undefined
    let supabaseServiceKey: string | undefined

    switch (network) {
        case 'mainnet':
            // Production Supabase instance for mainnet
            supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL_MAINNET || env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MAINNET || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            supabaseServiceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY_MAINNET || serverEnv.SUPABASE_SERVICE_ROLE_KEY
            break
        case 'testnet':
        case 'development':
        default:
            // Development Supabase instance for testnet/development
            supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL_TESTNET || env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TESTNET || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            supabaseServiceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY_TESTNET || serverEnv.SUPABASE_SERVICE_ROLE_KEY
            break
    }

    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log('[supabase] Server configuration:', {
            network,
            supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
            hasAnonKey: !!supabaseAnonKey,
            hasServiceKey: !!supabaseServiceKey,
        })
    }

    return { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
}

/**
 * @deprecated Use getSupabaseClientConfig() for client-side or getSupabaseServerConfig() for server-side
 */
export function getSupabaseConfig() {
    console.warn(
        '⚠️ getSupabaseConfig() is deprecated. Use getSupabaseClientConfig() for client-side or getSupabaseServerConfig() for server-side.',
    )
    return getSupabaseClientConfig()
}

/**
 * Create a Supabase client for use in the browser.
 * This client will persist the user session in localStorage.
 */
export function createSupabaseBrowserClient() {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseClientConfig()

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[supabase] Missing required environment variables for browser client')
        throw new Error('Missing Supabase configuration for browser client')
    }

    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log('[supabase] Creating browser client with URL:', supabaseUrl.substring(0, 30) + '...')
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Create a Supabase client for use on the server.
 * This client will use cookies to persist the user session.
 */
export function createSupabaseServerClient() {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig()

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[supabase] Missing required environment variables for server client')
        throw new Error('Missing Supabase configuration for server client')
    }

    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log('[supabase] Creating server client with URL:', supabaseUrl.substring(0, 30) + '...')
    }

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(_name: string) {
                // This is a simplified implementation
                // In a real server component, you'd use the actual cookies API
                return undefined
            },
            set(_name: string, _value: string, _options: Record<string, unknown>) {
                // This is a simplified implementation
                // In a real server component, you'd use the actual cookies API
            },
            remove(_name: string, _options: Record<string, unknown>) {
                // This is a simplified implementation
                // In a real server component, you'd use the actual cookies API
            },
        },
    })
}

/**
 * Get current network environment
 */
export function getCurrentNetwork() {
    return env.NEXT_PUBLIC_NETWORK
}
