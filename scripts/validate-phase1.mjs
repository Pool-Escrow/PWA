#!/usr/bin/env node

/**
 * Phase 1 Validation Script
 * Tests the basic infrastructure components for Goldsky + Neon migration
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const REQUIRED_ENV_VARS = [
    'NEON_DATABASE_URL',
    'GOLDSKY_API_KEY',
    'GOLDSKY_SUBGRAPH_ID',
    'GOLDSKY_WEBHOOK_SECRET',
    'WEBHOOK_URL',
]

const OPTIONAL_ENV_VARS = ['NEXT_PUBLIC_VERBOSE_LOGS', 'NODE_ENV']

async function validateEnvironment() {
    console.log('🔍 Validating environment configuration...\n')

    let valid = true

    // Check required variables
    console.log('Required Environment Variables:')
    for (const envVar of REQUIRED_ENV_VARS) {
        const value = process.env[envVar]
        if (value) {
            console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`)
        } else {
            console.log(`❌ ${envVar}: NOT SET`)
            valid = false
        }
    }

    console.log('\nOptional Environment Variables:')
    for (const envVar of OPTIONAL_ENV_VARS) {
        const value = process.env[envVar]
        console.log(`${value ? '✅' : '⚠️ '} ${envVar}: ${value || 'NOT SET'}`)
    }

    return valid
}

async function validateWebhookEndpoint() {
    console.log('\n🕳️ Validating webhook endpoint...\n')

    const webhookUrl = process.env.WEBHOOK_URL
    if (!webhookUrl) {
        console.log('❌ WEBHOOK_URL not configured')
        return false
    }

    try {
        const testUrl = `${webhookUrl}/api/webhooks/goldsky`
        console.log(`Testing: ${testUrl}`)

        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Phase1-Validator/1.0',
            },
        })

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Webhook endpoint accessible')
            console.log('📊 Response:', data)
            return true
        } else {
            console.log(`❌ Webhook endpoint returned ${response.status}`)
            return false
        }
    } catch (error) {
        console.log('❌ Webhook endpoint not accessible:', error.message)
        console.log('💡 Tip: Make sure your Next.js app is running and ngrok is active')
        return false
    }
}

async function validateNeonDatabase() {
    console.log('\n🗄️ Validating Neon database configuration...\n')

    const neonUrl = process.env.NEON_DATABASE_URL
    if (!neonUrl) {
        console.log('❌ NEON_DATABASE_URL not configured')
        return false
    }

    try {
        // Parse the connection string
        const url = new URL(neonUrl)
        console.log(`✅ Database host: ${url.hostname}`)
        console.log(`✅ Database name: ${url.pathname.substring(1)}`)
        console.log(`✅ Database user: ${url.username}`)
        console.log(`✅ SSL configured: ${url.searchParams.get('sslmode') || 'default'}`)

        // TODO: Phase 2 - Add actual connection test
        console.log('⚠️  Connection test will be implemented in Phase 2')
        return true
    } catch (error) {
        console.log('❌ Invalid NEON_DATABASE_URL format:', error.message)
        return false
    }
}

async function validateGoldskyConfiguration() {
    console.log('\n🪞 Validating Goldsky configuration...\n')

    const apiKey = process.env.GOLDSKY_API_KEY
    const subgraphId = process.env.GOLDSKY_SUBGRAPH_ID
    const webhookSecret = process.env.GOLDSKY_WEBHOOK_SECRET

    if (!apiKey) {
        console.log('❌ GOLDSKY_API_KEY not configured')
        return false
    }

    if (!subgraphId) {
        console.log('❌ GOLDSKY_SUBGRAPH_ID not configured')
        console.log('💡 This will be set after subgraph deployment')
        return false
    }

    if (!webhookSecret) {
        console.log('❌ GOLDSKY_WEBHOOK_SECRET not configured')
        return false
    }

    console.log(`✅ API Key: ${apiKey.substring(0, 10)}...`)
    console.log(`✅ Subgraph ID: ${subgraphId}`)
    console.log(`✅ Webhook Secret: ${webhookSecret.substring(0, 10)}...`)

    // TODO: Test API connection to Goldsky
    console.log('⚠️  API connection test will be added in Phase 2')

    return true
}

async function validateFileStructure() {
    console.log('\n📁 Validating Phase 1 file structure...\n')

    const requiredFiles = [
        'neon-schema.sql',
        'goldsky-subgraph.yaml',
        'goldsky-schema.graphql',
        'goldsky-mirror-config.yaml',
        'src/app/api/webhooks/goldsky/route.ts',
        'src/lib/neon.ts',
        'docs/phase1-setup-guide.md',
    ]

    let allExist = true

    for (const file of requiredFiles) {
        try {
            await import('fs').then(fs => fs.promises.access(file))
            console.log(`✅ ${file}`)
        } catch {
            console.log(`❌ ${file} - NOT FOUND`)
            allExist = false
        }
    }

    return allExist
}

function printNextSteps(validationResults) {
    console.log('\n🚀 Phase 1 Validation Summary\n')

    const { environment, webhook, database, goldsky, fileStructure } = validationResults
    const allValid = environment && webhook && database && goldsky && fileStructure

    if (allValid) {
        console.log('🎉 All Phase 1 components validated successfully!')
        console.log('\n📋 Next Steps:')
        console.log('1. Deploy subgraph to Goldsky platform')
        console.log('2. Configure Goldsky Mirror with Neon database')
        console.log('3. Test end-to-end data flow with contract interactions')
        console.log('4. Begin Phase 2 development')
    } else {
        console.log('⚠️  Some components need attention:')
        if (!environment) console.log('- Fix environment variable configuration')
        if (!webhook) console.log('- Ensure webhook endpoint is accessible')
        if (!database) console.log('- Verify Neon database configuration')
        if (!goldsky) console.log('- Complete Goldsky setup')
        if (!fileStructure) console.log('- Create missing Phase 1 files')

        console.log('\n📖 See docs/phase1-setup-guide.md for detailed instructions')
    }
}

// Main validation function
async function main() {
    console.log('🔬 Phase 1 Infrastructure Validation\n')
    console.log('Goldsky Mirror + Neon Database Migration\n')
    console.log('='.repeat(50))

    const results = {
        environment: await validateEnvironment(),
        webhook: await validateWebhookEndpoint(),
        database: await validateNeonDatabase(),
        goldsky: await validateGoldskyConfiguration(),
        fileStructure: await validateFileStructure(),
    }

    printNextSteps(results)

    // Exit with error code if validation failed
    const success = Object.values(results).every(Boolean)
    process.exit(success ? 0 : 1)
}

// Run validation
main().catch(error => {
    console.error('❌ Validation script failed:', error)
    process.exit(1)
})
