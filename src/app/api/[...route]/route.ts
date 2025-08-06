import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { createPublicClient, http, parseAbi } from 'viem'
import { baseSepolia } from 'viem/chains'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

// ABI to read ERC20 balance
const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
])

// Configure viem client for Base Sepolia
const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

// Token addresses
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
const DROP_ADDRESS = '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b'

app.get('/health', (c) => {
  return c.json({
    message: 'OK',
  })
})

app.get('/balances/:address', async (c) => {
  try {
    const address = c.req.param('address') as App.Address

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({ error: 'Invalid address' }, 400)
    }

    // Read balances in parallel
    const [usdcBalance, dropBalance, usdcDecimals, dropDecimals, usdcSymbol, dropSymbol] = await Promise.all([
      client.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      }),
      client.readContract({
        address: DROP_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      }),
      client.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      client.readContract({
        address: DROP_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      client.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
      client.readContract({
        address: DROP_ADDRESS,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
    ])

    // Convert balances to readable format
    const formatBalance = (balance: bigint, decimals: number) => {
      return Number(balance) / 10 ** decimals
    }

    return c.json({
      address,
      balances: {
        usdc: {
          symbol: usdcSymbol,
          balance: formatBalance(usdcBalance, usdcDecimals),
          rawBalance: usdcBalance.toString(),
        },
        drop: {
          symbol: dropSymbol,
          balance: formatBalance(dropBalance, dropDecimals),
          rawBalance: dropBalance.toString(),
        },
      },
    })
  }
  catch (error) {
    console.error('Error reading balances:', error)
    return c.json({ error: 'Error reading balances' }, 500)
  }
})

app.get('/user-info/:privyId', async (c) => {
  try {
    const privyId = c.req.param('privyId')

    if (!privyId) {
      return c.json({ error: 'Privy ID required' }, 400)
    }

    // TODO: Implement Supabase query here
    // const supabase = getSupabaseBrowserClient()
    // const { data } = await supabase.from('users').select('avatar, displayName').eq('privyId', privyId).maybeSingle()

    // For now, return mock data
    const mockData = {
      privyId,
      avatar: null,
      displayName: null,
    }

    await Promise.resolve() // Add await to satisfy linter
    return c.json(mockData)
  }
  catch (error) {
    console.error('Error fetching user info:', error)
    return c.json({ error: 'Error fetching user info' }, 500)
  }
})

export const GET = handle(app)
