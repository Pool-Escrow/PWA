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

console.log('🔧 Pool Synchronization Helper')
console.log('===============================')
console.log(`Network: ${network}`)
console.log('')

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

async function analyzePools() {
    try {
        const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Missing Supabase configuration')
            return
        }

        console.log(`📊 Connecting to: ${supabaseUrl.substring(0, 30)}...`)

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get all pools
        const { data: dbPools, error } = await supabase.from('pools').select('*').order('contract_id')

        if (error) {
            console.error('❌ Error fetching pools:', error.message)
            return
        }

        console.log('')
        console.log('📋 POOL SYNCHRONIZATION ANALYSIS')
        console.log('================================')

        if (!dbPools || dbPools.length === 0) {
            console.log('❌ No pools found in database')
            return
        }

        console.log(`Total pools in database: ${dbPools.length}`)

        // Analyze contract IDs
        const contractIds = dbPools.map(pool => pool.contract_id).filter(id => id !== null)
        const minId = Math.min(...contractIds)
        const maxId = Math.max(...contractIds)

        console.log(`Contract ID range: ${minId} - ${maxId}`)

        // Find gaps in contract IDs
        const missingIds = []
        for (let i = minId; i <= maxId; i++) {
            if (!contractIds.includes(i)) {
                missingIds.push(i)
            }
        }

        if (missingIds.length > 0) {
            console.log(`Missing contract IDs: ${missingIds.join(', ')}`)
        } else {
            console.log('✅ No gaps in contract ID sequence')
        }

        // Status analysis
        const statusGroups = dbPools.reduce((acc, pool) => {
            const status = pool.status || 'unknown'
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {})

        console.log('')
        console.log('📊 Status Distribution:')
        Object.entries(statusGroups).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`)
        })

        // Token analysis
        const tokenGroups = dbPools.reduce((acc, pool) => {
            const token = pool.tokenAddress ? `${pool.tokenAddress.substring(0, 10)}...` : 'none'
            acc[token] = (acc[token] || 0) + 1
            return acc
        }, {})

        console.log('')
        console.log('🪙 Token Distribution:')
        Object.entries(tokenGroups).forEach(([token, count]) => {
            console.log(`  ${token}: ${count}`)
        })

        // Recent pools
        console.log('')
        console.log('📅 Recent Pools (last 5):')
        const recentPools = dbPools
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)

        recentPools.forEach(pool => {
            const date = new Date(pool.createdAt).toLocaleDateString()
            console.log(`  Pool ${pool.contract_id}: ${pool.name} (${pool.status}, ${date})`)
        })

        console.log('')
        console.log('💡 RECOMMENDATIONS:')
        console.log('===================')

        if (missingIds.length > 0) {
            console.log('1. ⚠️  There are gaps in contract IDs. This might indicate:')
            console.log('   - Pools were deleted from the database')
            console.log('   - Pools exist in the blockchain but not in the database')
            console.log('   - Contract deployment issues')
        }

        const visibleStatuses = ['draft', 'unconfirmed', 'inactive', 'depositsEnabled']
        const visibleCount = dbPools.filter(pool => visibleStatuses.includes(pool.status)).length

        console.log(`2. 📊 Pools with visible status: ${visibleCount}/${dbPools.length}`)
        if (visibleCount === 0) {
            console.log('   ❌ No pools have visible status! This explains why no pools are loading.')
            console.log('   🔧 Consider updating pool status to make them visible.')
        } else {
            console.log('   ✅ Some pools should be visible with the status mapping fix.')
        }

        console.log('3. 🔄 To sync pools with blockchain:')
        console.log('   - Run contract calls to get blockchain pool data')
        console.log('   - Compare with database pools')
        console.log('   - Update missing or outdated pools')
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

await analyzePools()
