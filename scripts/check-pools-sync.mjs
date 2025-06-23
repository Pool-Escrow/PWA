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

console.log('🔄 Pool Synchronization Check')
console.log('==============================')
console.log(`Network: ${network}`)
console.log('')

/**
 * Get Supabase configuration based on network environment
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

async function checkPoolsSync() {
    try {
        const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Missing Supabase configuration')
            return
        }

        console.log(`📊 Connecting to: ${supabaseUrl.substring(0, 30)}...`)

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // First, let's see what columns exist in the pools table
        console.log('')
        console.log('🔍 Checking table schema...')
        const { data: allPools, error: allError } = await supabase.from('pools').select('*').limit(1)

        if (allError) {
            console.error('❌ Error accessing pools table:', allError.message)
            return
        }

        if (allPools && allPools.length > 0) {
            console.log('📋 Available columns in pools table:')
            console.log('------------------------------------')
            Object.keys(allPools[0]).forEach(column => {
                console.log(`- ${column}`)
            })
        }

        // Get pools from database with available columns
        const { data: dbPools, error } = await supabase.from('pools').select('*').order('contract_id')

        if (error) {
            console.error('❌ Error fetching pools from database:', error.message)
            return
        }

        console.log('')
        console.log('📋 Database Pools:')
        console.log('------------------')
        if (dbPools && dbPools.length > 0) {
            dbPools.forEach((pool, index) => {
                const poolId = pool.contract_id || pool.id || index + 1
                const poolName = pool.name || pool.title || pool.description || 'Unnamed Pool'
                const createdAt = pool.createdAt ? new Date(pool.createdAt).toLocaleDateString() : 'Unknown'
                const status = pool.status || 'unknown'
                const tokenAddress = pool.tokenAddress ? `${pool.tokenAddress.substring(0, 8)}...` : 'none'

                console.log(`Pool ${poolId}: ${poolName}`)
                console.log(`  Status: ${status} | Token: ${tokenAddress} | Created: ${createdAt}`)
            })
            console.log(`\nTotal pools in DB: ${dbPools.length}`)

            // Group by status
            const statusGroups = dbPools.reduce((acc, pool) => {
                const status = pool.status || 'unknown'
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {})

            console.log('\n📊 Pools by Status:')
            Object.entries(statusGroups).forEach(([status, count]) => {
                console.log(`  ${status}: ${count}`)
            })
        } else {
            console.log('No pools found in database')
        }

        console.log('')
        console.log('💡 Tips:')
        console.log('--------')
        console.log('1. If you see "Found pools in contract that do not exist in DB" warnings,')
        console.log('   it means the blockchain has pools that are not in your Supabase database.')
        console.log('2. Make sure you are using the correct network and Supabase instance.')
        console.log('3. Pools need to have matching contract_id between blockchain and DB.')
        console.log('4. Check if pools have the correct status for display (depositsEnabled, etc.)')
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

await checkPoolsSync()
