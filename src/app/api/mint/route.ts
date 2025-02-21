import { NextResponse } from 'next/server'
import { createWalletClient, http, encodeFunctionData, Chain, Transport, Address } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Load environment variables (store private key securely in .env.local)
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY! // Admin's private key

const MINT_AMOUNT = BigInt(1000 * 10 ** 18) // 1000 tokens with 18 decimals
const network = process.env.NEXT_PUBLIC_NETWORK || 'development'
const chainConfig = {
    mainnet: base,
    testnet: baseSepolia,
    development: baseSepolia,
}
const tokenConfig = {
    mainnet: '0xd8a698486782d0d3fa336C0F8dd7856196C97616',
    testnet: '0xc9e3a0b2d65cbb151fa149608f99791543290d6d',
    development: '0xc9e3a0b2d65cbb151fa149608f99791543290d6d',
}
const chain = chainConfig[network as keyof typeof chainConfig] as Chain
const RPC_ENDPOINTS: Record<string, string> = {
    mainnet: process.env.RPC_MAINNET || 'https://mainnet.base.org',
    testnet: process.env.RPC_TESTNET || 'https://sepolia.base.org',
    development: process.env.RPC_TESTNET || 'https://sepolia.base.org', // Default to testnet in development
}
const transport = http(RPC_ENDPOINTS[network]) 
const tokenAddress = tokenConfig[network as keyof typeof tokenConfig]

// ERC-20 ABI (minimal ABI containing `mint`)
const tokenAbi = [
    {
        "type": "function",
        "name": "mint",
        "inputs": [
            { "name": "to", "type": "address" },
            { "name": "value", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "outputs": []
    }
]

export async function POST(req: Request) {
    try {
        // Parse user address from the request body
        const { address } = await req.json()
        console.log('userAddress', address)
        if (!address) return NextResponse.json({ error: 'No user address provided' }, { status: 400 })

        console.log(`Minting 1000 tokens to: ${address}`)

        // Create an account from the private key
        const account = privateKeyToAccount(`0x${PRIVATE_KEY}`) as any // Ensure the key starts with `0x`

        // Create a wallet client for signing transactions
        const walletClient = createWalletClient({
            account,
            chain, 
            transport,
        })

        // Encode mint function call
        const txData = encodeFunctionData({
            abi: tokenAbi,
            functionName: 'mint',
            args: [address, MINT_AMOUNT],
        })

        // Send transaction
        const txHash = await walletClient.sendTransaction({
            to: tokenAddress as Address,
            data: txData,
            account, // Admin's account
            value: BigInt(0), // No ETH transfer
        })

        console.log(`Transaction sent: ${txHash}`)
        return NextResponse.json({ success: true, txHash })
    } catch (error: any) {
        console.error('Minting failed:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}