#!/usr/bin/env node

import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '..', '.env.development.local') })

const network = process.env.NEXT_PUBLIC_NETWORK || 'development'

console.log('🔍 Supabase Configuration Debug')
console.log('================================')
console.log(`Network: ${network}`)
console.log('')

/**
 * Get Supabase configuration based on network environment
 */
function getSupabaseConfig() {
    let supabaseUrl, supabaseAnonKey, supabaseServiceKey

    switch (network) {
        case 'mainnet':
            supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_MAINNET || process.env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey =
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MAINNET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_MAINNET || process.env.SUPABASE_SERVICE_ROLE_KEY
            break
        case 'testnet':
        case 'development':
        default:
            supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_TESTNET || process.env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey =
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TESTNET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_TESTNET || process.env.SUPABASE_SERVICE_ROLE_KEY
            break
    }

    return { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
}

const configData = getSupabaseConfig()

console.log('Configuration Details:')
console.log('----------------------')
console.log(`Supabase URL: ${configData.supabaseUrl ? `${configData.supabaseUrl.substring(0, 30)}...` : 'MISSING'}`)
console.log(`Anon Key: ${configData.supabaseAnonKey ? 'PRESENT' : 'MISSING'}`)
console.log(`Service Key: ${configData.supabaseServiceKey ? 'PRESENT' : 'MISSING'}`)
console.log('')

// Check if fallback values are being used
console.log('Fallback Check:')
console.log('---------------')
console.log(`Using fallback URL: ${configData.supabaseUrl === process.env.NEXT_PUBLIC_SUPABASE_URL ? 'YES' : 'NO'}`)
console.log(
    `Using fallback Anon Key: ${configData.supabaseAnonKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES' : 'NO'}`,
)
console.log(
    `Using fallback Service Key: ${configData.supabaseServiceKey === process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES' : 'NO'}`,
)
console.log('')

// Environment variables check
console.log('Environment Variables:')
console.log('----------------------')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING'}`)
console.log(`NEXT_PUBLIC_SUPABASE_URL_TESTNET: ${process.env.NEXT_PUBLIC_SUPABASE_URL_TESTNET ? 'PRESENT' : 'MISSING'}`)
console.log(`NEXT_PUBLIC_SUPABASE_URL_MAINNET: ${process.env.NEXT_PUBLIC_SUPABASE_URL_MAINNET ? 'PRESENT' : 'MISSING'}`)
console.log('')

if (!configData.supabaseUrl || !configData.supabaseAnonKey || !configData.supabaseServiceKey) {
    console.log('❌ ERROR: Missing required Supabase configuration!')
    process.exit(1)
} else {
    console.log('✅ SUCCESS: All required Supabase configuration is present!')
}
