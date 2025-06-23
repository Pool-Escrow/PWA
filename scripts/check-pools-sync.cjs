#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.development.local' })

const { createClient } = require('@supabase/supabase-js')

const network = process.env.NEXT_PUBLIC_NETWORK || 'development'

console.log('🔄 Pool Synchronization Check')
console.log('==============================')
console.log(`Network: ${network}`)
console.log('')

// Get Supabase configuration
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
                const createdAt = pool.created_at ? new Date(pool.created_at).toLocaleDateString() : 'Unknown'
                console.log(`Pool ${poolId}: ${poolName} (created: ${createdAt})`)
            })
            console.log(`\nTotal pools in DB: ${dbPools.length}`)
        } else {
            console.log('No pools found in database')
        }

        console.log('')
        console.log('💡 Tips:')
        console.log('--------')
        console.log('1. If you see "Found pools in contract that do not exist in DB" warnings,')
        console.log('   it means the blockchain has pools that are not in your Supabase database.')
        console.log('2. Make sure you are using the correct network and Supabase instance.')
        console.log('3. You may need to sync/create the missing pools in your database.')
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

checkPoolsSync()
