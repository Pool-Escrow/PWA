#!/usr/bin/env bun

/**
 * Extract contract deployment addresses from Foundry broadcast files
 * and update wagmi config with actual deployed addresses
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { glob } from 'glob'

interface BroadcastTransaction {
  contractName?: string
  contractAddress?: string
  hash?: string
}

interface BroadcastFile {
  transactions?: BroadcastTransaction[]
}

interface ChainDeployments {
  [contractName: string]: {
    [chainId: string]: string
  }
}

const CHAIN_MAPPINGS = {
  84532: 'Base Sepolia',
  8453: 'Base Mainnet',
  31337: 'Local Anvil',
} as const

async function extractDeployments(): Promise<ChainDeployments> {
  console.log('🔍 Extracting deployment addresses from Foundry broadcast files...')

  const deployments: ChainDeployments = {}
  const contractsDir = './contracts'

  if (!existsSync(contractsDir)) {
    console.error('❌ Contracts directory not found')
    process.exit(1)
  }

  // Find all broadcast run-latest.json files
  const broadcastFiles = await glob('**/broadcast/**/run-latest.json', {
    cwd: contractsDir,
  })

  console.log(`📁 Found ${broadcastFiles.length} broadcast files`)

  for (const file of broadcastFiles) {
    const fullPath = join(contractsDir, file)

    // Extract chain ID from path (e.g., broadcast/Deploy.s.sol/84532/run-latest.json)
    const pathParts = file.split('/')
    const chainId = pathParts.find(part => /^\d+$/.test(part))

    if (chainId === undefined) {
      console.warn(`⚠️ Could not extract chain ID from ${file}`)
      continue
    }

    try {
      const content = readFileSync(fullPath, 'utf-8')
      const broadcast = JSON.parse(content) as BroadcastFile

      if (!broadcast.transactions) {
        continue
      }

      // Find Pool contract deployment
      for (const tx of broadcast.transactions) {
        if (tx.contractName === 'Pool' && tx.contractAddress !== undefined) {
          if (deployments.Pool === undefined) {
            deployments.Pool = {}
          }

          deployments.Pool[Number(chainId)] = tx.contractAddress
          console.log(
            `✅ Found Pool on ${CHAIN_MAPPINGS[Number(chainId) as keyof typeof CHAIN_MAPPINGS] || `Chain ${chainId}`}: ${tx.contractAddress}`,
          )
        }
      }
    }
    catch (error) {
      console.warn(`⚠️ Error parsing ${file}:`, error)
    }
  }

  return deployments
}

async function updateWagmiConfig(deployments: ChainDeployments) {
  console.log('📝 Updating wagmi.config.ts...')

  const configPath = './wagmi.config.ts'

  if (!existsSync(configPath)) {
    console.error('❌ wagmi.config.ts not found')
    process.exit(1)
  }

  let config = readFileSync(configPath, 'utf-8')

  // Add or update deployments in the config
  if (deployments.Pool !== undefined) {
    const poolDeployments = Object.entries(deployments.Pool)
      .map(([chainId, address]) => `        ${chainId}: '${address}',`)
      .join('\n')

    // Check if deployments section exists
    if (config.includes('deployments:')) {
      // Update existing deployments
      config = config.replace(
        /Pool: \{[\s\S]*?\}/,
        `Pool: {
${poolDeployments}
        }`,
      )
    }
    else {
      // Add deployments section to foundry plugin
      config = config.replace(
        /foundry\(\{/,
        `foundry({
      deployments: {
        Pool: {
${poolDeployments}
        },
      },`,
      )
    }
  }

  writeFileSync(configPath, config)
  console.log('✅ wagmi.config.ts updated successfully')
}

async function generateContracts() {
  console.log('🔧 Generating contract types with wagmi-cli...')

  const { execSync } = await import('node:child_process')

  try {
    execSync('bun wagmi generate', { stdio: 'inherit' })
    console.log('✅ Contract types generated successfully')
  }
  catch (error) {
    console.error('❌ Error generating contract types:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Starting deployment extraction and contract generation...\n')

  try {
    // Step 1: Extract deployments from broadcast files
    const deployments = await extractDeployments()

    if (Object.keys(deployments).length === 0) {
      console.warn('⚠️ No deployments found. Make sure contracts are deployed.')
      return
    }

    // Step 2: Update wagmi config with real addresses
    await updateWagmiConfig(deployments)

    // Step 3: Generate TypeScript types
    await generateContracts()

    console.log('\n🎉 All done! Your contract types and addresses are ready to use.')
    console.log('💡 Import from: src/lib/contracts/generated.ts')
  }
  catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run if called directly
if ((import.meta as ImportMeta & { main?: boolean }).main === true) {
  void main()
}

export { extractDeployments, generateContracts, updateWagmiConfig }
