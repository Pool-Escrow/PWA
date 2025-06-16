#!/usr/bin/env node

/**
 * Database Health Check Script
 *
 * This script performs a health check on a Supabase database to keep it active.
 * It relies on Node.js's built-in support for .env files.
 *
 * Run with:
 * - `pnpm db:health:dev` (uses .env.development.local)
 * - `pnpm db:health:prod` (uses .env.production.local)
 *
 * It requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set
 * in the corresponding .env file or as environment variables.
 */

// Retrieve environment variables. These are loaded by Node.js via the --env-file flag
// in the npm scripts or set directly in the GitHub Actions workflow.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const NODE_ENV = process.env.NODE_ENV || 'development'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(
        `❌ Error: Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are defined in the relevant .env file or as environment variables.`,
    )
    process.exit(1)
}

/**
 * Performs a health check on the configured Supabase database.
 * @returns {Promise<boolean>} - Success status
 */
async function performHealthCheck() {
    try {
        console.log(`🔍 Performing health check for ${NODE_ENV} database...`)

        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
        })

        if (!response.ok) {
            console.error(`❌ ${NODE_ENV} DB health check failed: HTTP ${response.status}`)
            return false
        }

        console.log(`✅ ${NODE_ENV} database is healthy`)
        console.log(`📊 Query executed successfully at: ${new Date().toISOString()}`)
        return true
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error(`❌ ${NODE_ENV} DB connection failed:`, errorMessage)
        return false
    }
}

/**
 * Main function to run the health check.
 */
async function main() {
    console.log('🚀 Starting database health check...')

    const isHealthy = await performHealthCheck()

    console.log('\n📋 Health Check Summary:')
    console.log('='.repeat(50))

    if (isHealthy) {
        console.log(`✅ Environment: ${NODE_ENV}`)
        console.log('🎉 Database is healthy!')
        process.exit(0)
    } else {
        console.error(`❌ Environment: ${NODE_ENV}`)
        console.error('⚠️ Database health check failed.')
        process.exit(1)
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
})

process.on('uncaughtException', error => {
    console.error('❌ Uncaught Exception:', error)
    process.exit(1)
})

// Run the health checks
main().catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
})
