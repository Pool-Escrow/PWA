import type { PoolItem } from '@/types/pools'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { createPublicClient, http, parseAbi } from 'viem'
import { baseSepolia } from 'viem/chains'
import { POOLSTATUS } from '@/types/pools'

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

// Mock pools data - using ISO strings for consistent JSON serialization
const mockPools: PoolItem[] = [
  {
    id: '1',
    name: 'Weekly Challenge Pool',
    image: '/app/images/frog.png',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
    status: POOLSTATUS.DEPOSIT_ENABLED,
    numParticipants: 15,
    softCap: 50,
    hostAddress: '0x1234567890123456789012345678901234567890',
    depositAmountPerPerson: 10,
    description: 'Weekly fitness challenge pool',
  },
  {
    id: '2',
    name: 'Morning Workout Pool',
    image: '/app/images/frog.png',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
    status: POOLSTATUS.DEPOSIT_ENABLED,
    numParticipants: 8,
    softCap: 20,
    hostAddress: '0x2345678901234567890123456789012345678901',
    depositAmountPerPerson: 5,
    description: 'Early morning workout commitment pool',
  },
  {
    id: '3',
    name: 'Study Group Challenge',
    image: '/app/images/frog.png',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: POOLSTATUS.STARTED,
    numParticipants: 12,
    softCap: 15,
    hostAddress: '0x3456789012345678901234567890123456789012',
    depositAmountPerPerson: 15,
    description: 'Daily study commitment pool',
  },
  {
    id: '4',
    name: 'Reading Challenge',
    image: '/app/images/frog.png',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: POOLSTATUS.ENDED,
    numParticipants: 25,
    softCap: 30,
    hostAddress: '0x4567890123456789012345678901234567890123',
    depositAmountPerPerson: 20,
    description: 'Monthly reading challenge pool',
  },
]

// Pools endpoints
app.get('/pools', (c) => {
  try {
    return c.json({
      pools: mockPools,
      total: mockPools.length,
    })
  }
  catch (error) {
    console.error('Error fetching pools:', error)
    return c.json({ error: 'Error fetching pools' }, 500)
  }
})

app.get('/pools/upcoming', (c) => {
  try {
    const upcomingPools = mockPools.filter(pool =>
      pool.status === POOLSTATUS.DEPOSIT_ENABLED
      || pool.status === POOLSTATUS.STARTED,
    )

    return c.json({
      pools: upcomingPools,
      total: upcomingPools.length,
    })
  }
  catch (error) {
    console.error('Error fetching upcoming pools:', error)
    return c.json({ error: 'Error fetching upcoming pools' }, 500)
  }
})

app.get('/pools/user/:address', async (c) => {
  try {
    const address = c.req.param('address')

    // Mock user pools - in real implementation, filter by user participation
    const userPools = mockPools.filter((_, index) => index < 2) // Mock: first 2 pools for any user

    return c.json({
      pools: userPools,
      total: userPools.length,
      address,
    })
  }
  catch (error) {
    console.error('Error fetching user pools:', error)
    return c.json({ error: 'Error fetching user pools' }, 500)
  }
})

app.get('/pools/:id', (c) => {
  try {
    const id = c.req.param('id')
    const pool = mockPools.find(p => p.id === id)

    if (!pool) {
      return c.json({ error: 'Pool not found' }, 404)
    }

    return c.json({ pool })
  }
  catch (error) {
    console.error('Error fetching pool details:', error)
    return c.json({ error: 'Error fetching pool details' }, 500)
  }
})

export const GET = handle(app)
