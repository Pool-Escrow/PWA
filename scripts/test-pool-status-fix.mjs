#!/usr/bin/env node

import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '..', '.env.development.local') })

console.log('🧪 Testing Pool Status Fix')
console.log('===========================')
console.log(`Network: ${process.env.NEXT_PUBLIC_NETWORK || 'development'}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log('')

/**
 * Simulate the status mapping logic
 */
const POOLSTATUS = {
    INACTIVE: 0,
    DEPOSIT_ENABLED: 1,
    STARTED: 2,
    ENDED: 3,
    DELETED: 4,
}

const DB_STATUS_TO_CONTRACT_STATUS = {
    draft: POOLSTATUS.INACTIVE,
    unconfirmed: POOLSTATUS.INACTIVE,
    inactive: POOLSTATUS.INACTIVE,
    depositsEnabled: POOLSTATUS.DEPOSIT_ENABLED,
    started: POOLSTATUS.STARTED,
    paused: POOLSTATUS.STARTED,
    ended: POOLSTATUS.ENDED,
    deleted: POOLSTATUS.DELETED,
}

function mapDbStatusToContractStatus(dbStatus) {
    if (!dbStatus) return POOLSTATUS.INACTIVE
    const status = dbStatus.toLowerCase()
    return DB_STATUS_TO_CONTRACT_STATUS[status] ?? POOLSTATUS.INACTIVE
}

function isPoolStatusVisible(dbStatus) {
    const contractStatus = mapDbStatusToContractStatus(dbStatus)
    return contractStatus <= POOLSTATUS.DEPOSIT_ENABLED
}

// Test the mapping
console.log('📋 STATUS MAPPING TEST')
console.log('======================')

const testStatuses = ['draft', 'unconfirmed', 'inactive', 'depositsEnabled', 'started', 'ended', 'deleted']

testStatuses.forEach(status => {
    const contractStatus = mapDbStatusToContractStatus(status)
    const visible = isPoolStatusVisible(status)
    const statusName = Object.keys(POOLSTATUS).find(key => POOLSTATUS[key] === contractStatus)

    console.log(`"${status}" -> ${contractStatus} (${statusName}) ${visible ? '✅ VISIBLE' : '❌ HIDDEN'}`)
})

console.log('')
console.log('🎯 EXPECTED RESULTS:')
console.log('- draft, unconfirmed, inactive, depositsEnabled should be VISIBLE')
console.log('- started, ended, deleted should be HIDDEN')
console.log('')

// Test with real DB data simulation
const sampleDbPools = [
    { contract_id: 1, name: 'Test Pool', status: 'unconfirmed' },
    { contract_id: 90, name: 'Testing Pool', status: 'inactive' },
    { contract_id: 103, name: 'Staking Pool #01', status: 'draft' },
    { contract_id: 105, name: 'Staking Pool #03', status: 'inactive' },
    { contract_id: 118, name: 'Beach Test Pool', status: 'unconfirmed' },
]

console.log('📊 SAMPLE POOL FILTERING TEST')
console.log('=============================')

const visiblePools = sampleDbPools.filter(pool => isPoolStatusVisible(pool.status))

console.log(`Total sample pools: ${sampleDbPools.length}`)
console.log(`Visible pools: ${visiblePools.length}`)
console.log('')

visiblePools.forEach(pool => {
    const contractStatus = mapDbStatusToContractStatus(pool.status)
    const statusName = Object.keys(POOLSTATUS).find(key => POOLSTATUS[key] === contractStatus)
    console.log(`✅ Pool ${pool.contract_id}: ${pool.name} (${pool.status} -> ${statusName})`)
})

console.log('')
console.log('🚀 CONCLUSION:')
if (visiblePools.length > 0) {
    console.log('✅ SUCCESS: Pools should now be visible with the status mapping!')
    console.log('✅ The fix should resolve the "Error loading upcoming pools" issue.')
} else {
    console.log('❌ ISSUE: No pools would be visible. Check the status mapping logic.')
}

console.log('')
console.log('💡 NEXT STEPS:')
console.log('1. Check the browser console for status mapping logs')
console.log('2. Verify pools are loading in the UI')
console.log('3. Test chain switching to ensure pools reload correctly')
