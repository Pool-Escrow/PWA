#!/usr/bin/env node

/**
 * Test script to verify RPC endpoints are working correctly
 * Run with: node scripts/test-rpc-endpoints.mjs
 */

/**
 * @typedef {Object} RPCResponse
 * @property {string} jsonrpc - JSON-RPC version
 * @property {string} [result] - The result of the RPC call
 * @property {RPCError} [error] - Error object if the call failed
 * @property {number} id - Request ID
 */

/**
 * @typedef {Object} RPCError
 * @property {number} code - Error code
 * @property {string} message - Error message
 * @property {any} [data] - Additional error data
 */

/** @type {string[]} */
const BASE_SEPOLIA_ENDPOINTS = [
    'https://base-sepolia.publicnode.com',
    'https://base-sepolia-rpc.publicnode.com',
    'https://base-sepolia.gateway.tenderly.co',
    'https://sepolia.base.org', // Known problematic endpoint
]

/** @type {string[]} */
const BASE_MAINNET_ENDPOINTS = [
    'https://base.publicnode.com',
    'https://base.llamarpc.com',
    'https://base-rpc.publicnode.com',
]

/**
 * Tests a single RPC endpoint by calling eth_chainId
 * @param {string} url - The RPC endpoint URL to test
 * @param {number} chainId - The expected chain ID
 * @returns {Promise<boolean>} - True if the endpoint is working correctly
 */
async function testEndpoint(url, chainId) {
    try {
        console.log(`🔍 Testing ${url}...`)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_chainId',
                params: [],
                id: 1,
            }),
        })

        if (!response.ok) {
            console.log(`❌ ${url}: HTTP ${response.status} ${response.statusText}`)
            return false
        }

        /** @type {unknown} */
        const data = await response.json()

        // Type guard for RPC response
        if (typeof data !== 'object' || data === null) {
            console.log(`❌ ${url}: Invalid response format`)
            return false
        }

        /** @type {RPCResponse} */
        const rpcResponse = data

        if ('error' in rpcResponse && rpcResponse.error) {
            const errorMessage =
                typeof rpcResponse.error === 'object' && rpcResponse.error !== null && 'message' in rpcResponse.error
                    ? String(rpcResponse.error.message)
                    : 'Unknown error'
            console.log(`❌ ${url}: RPC Error - ${errorMessage}`)
            return false
        }

        if (!('result' in rpcResponse) || typeof rpcResponse.result !== 'string') {
            console.log(`❌ ${url}: Missing or invalid result`)
            return false
        }

        const returnedChainId = parseInt(rpcResponse.result, 16)
        if (returnedChainId === chainId) {
            console.log(`✅ ${url}: Working (Chain ID: ${returnedChainId})`)
            return true
        } else {
            console.log(`⚠️ ${url}: Wrong chain ID (expected: ${chainId}, got: ${returnedChainId})`)
            return false
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.log(`❌ ${url}: ${errorMessage}`)
        return false
    }
}

/**
 * Tests all configured RPC endpoints for both Base Sepolia and Base Mainnet
 * @returns {Promise<void>}
 */
async function testAllEndpoints() {
    console.log('🚀 Testing Base Sepolia RPC endpoints...\n')

    const sepoliaResults = await Promise.all(BASE_SEPOLIA_ENDPOINTS.map(url => testEndpoint(url, 84532)))

    const workingSepolia = BASE_SEPOLIA_ENDPOINTS.filter((_, i) => sepoliaResults[i])

    console.log('\n🚀 Testing Base Mainnet RPC endpoints...\n')

    const mainnetResults = await Promise.all(BASE_MAINNET_ENDPOINTS.map(url => testEndpoint(url, 8453)))

    const workingMainnet = BASE_MAINNET_ENDPOINTS.filter((_, i) => mainnetResults[i])

    console.log('\n📊 Summary:')
    console.log(`✅ Working Base Sepolia endpoints: ${workingSepolia.length}/${BASE_SEPOLIA_ENDPOINTS.length}`)
    workingSepolia.forEach(url => console.log(`  - ${url}`))

    console.log(`✅ Working Base Mainnet endpoints: ${workingMainnet.length}/${BASE_MAINNET_ENDPOINTS.length}`)
    workingMainnet.forEach(url => console.log(`  - ${url}`))

    if (workingSepolia.length === 0) {
        console.log('\n⚠️ WARNING: No working Base Sepolia endpoints found!')
    }

    if (workingMainnet.length === 0) {
        console.log('\n⚠️ WARNING: No working Base Mainnet endpoints found!')
    }

    console.log('\n🎉 RPC endpoint testing complete!')
}

testAllEndpoints().catch(console.error)
