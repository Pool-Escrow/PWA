#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '..', '.env.development.local') })

const network = process.env.NEXT_PUBLIC_NETWORK || 'development'

console.log('🔍 Pool Status Investigation')
console.log('============================')
console.log(`Network: ${network}`)
console.log('')

/**
 * POOLSTATUS enum from the smart contract
 */
const POOLSTATUS = {
    INACTIVE: 0,
    DEPOSIT_ENABLED: 1,
    STARTED: 2,
    ENDED: 3,
    DELETED: 4,
}

/**
 * Get Supabase configuration
 */
function getSupabaseConfig() {
    let supabaseUrl, supabaseAnonKey

    switch (network) {
        case 'mainnet':
            supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_MAINNET || process.env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey =
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MAINNET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            break
        case 'testnet':
        case 'development':
        default:
            supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_TESTNET || process.env.NEXT_PUBLIC_SUPABASE_URL
            supabaseAnonKey =
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TESTNET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            break
    }

    return { supabaseUrl, supabaseAnonKey }
}

async function investigatePoolStatus() {
    try {
        const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Missing Supabase configuration')
            return
        }

        console.log(`📊 Connecting to: ${supabaseUrl.substring(0, 30)}...`)

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get all pools
        const { data: dbPools, error } = await supabase
            .from('pools')
            .select('contract_id, name, status')
            .order('contract_id')

        if (error) {
            console.error('❌ Error fetching pools:', error.message)
            return
        }

        console.log('')
        console.log('📋 STATUS ANALYSIS')
        console.log('==================')

        // Group by status
        const statusGroups = dbPools.reduce((acc, pool) => {
            const status = pool.status || 'unknown'
            if (!acc[status]) acc[status] = []
            acc[status].push(pool)
            return acc
        }, {})

        console.log('Database Status Distribution:')
        Object.entries(statusGroups).forEach(([status, pools]) => {
            console.log(`  ${status}: ${pools.length} pools`)
        })

        console.log('')
        console.log('🔧 PROBLEM ANALYSIS')
        console.log('===================')
        console.log('Smart Contract POOLSTATUS enum:')
        Object.entries(POOLSTATUS).forEach(([name, value]) => {
            console.log(`  ${name} = ${value}`)
        })

        console.log('')
        console.log('Database status values:')
        Object.keys(statusGroups).forEach(status => {
            console.log(`  "${status}"`)
        })

        console.log('')
        console.log('🚨 MISMATCH DETECTED:')
        console.log('- Smart contract uses NUMBERS (0, 1, 2, 3, 4)')
        console.log('- Database uses STRINGS ("draft", "unconfirmed", "inactive", etc.)')
        console.log('- useUpcomingPools filter: status <= DEPOSIT_ENABLED (1)')
        console.log('- No pools pass this filter because strings vs numbers!')

        console.log('')
        console.log('💡 POTENTIAL SOLUTIONS:')
        console.log('1. Update DB to use numeric status values')
        console.log('2. Create a mapping function between string and numeric status')
        console.log('3. Modify the filter to handle string status values')
        console.log('4. For development: Show pools regardless of status')

        console.log('')
        console.log('🎯 RECOMMENDED ACTION:')
        console.log('Create a status mapping function and update the filter logic')

        // Show some example pools that would be visible with correct mapping
        console.log('')
        console.log('📋 POOLS THAT SHOULD BE VISIBLE:')
        const visibleStatuses = ['draft', 'unconfirmed', 'inactive']
        const visiblePools = dbPools.filter(pool => visibleStatuses.includes(pool.status))
        console.log(`Found ${visiblePools.length} pools with potentially visible status:`)
        visiblePools.slice(0, 5).forEach(pool => {
            console.log(`  Pool ${pool.contract_id}: ${pool.name} (${pool.status})`)
        })
        if (visiblePools.length > 5) {
            console.log(`  ... and ${visiblePools.length - 5} more`)
        }
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

await investigatePoolStatus()
