import { AppShell } from '@/components/layout/app-shell'
import { PoolDetails } from '@/components/pools/pool-details'
import { PoolDataApiResponseSchema, safeParseWithError } from '@/lib/schemas'
import { transformPoolDataToUI } from '@/lib/utils/pool'

interface PoolPageProps {
  params: Promise<{ id: string }>
}

export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params

  // Validate pool ID
  const poolId = Number.parseInt(id, 10)
  if (Number.isNaN(poolId) || poolId <= 0) {
    return (
      <AppShell
        header={{
          backButton: true,
          title: 'Pool Not Found',
        }}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Pool Not Found</h1>
            <p className="text-gray-600">The pool you're looking for doesn't exist.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  let poolData: App.PoolData | null = null
  let error: string | null = null

  try {
    // Get pool data from API during SSR
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pools/84532/${poolId}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (!response.ok) {
      if (response.status === 404) {
        error = 'Pool not found'
      }
      else {
        error = 'Failed to load pool data'
      }
    }
    else {
      const rawData = await response.json() as unknown
      const result = safeParseWithError(PoolDataApiResponseSchema, rawData)

      if (!result.success) {
        error = `Invalid pool data: ${result.error}`
      }
      else if (!result.data.data) {
        error = 'No pool data received'
      }
      else {
        poolData = result.data.data
      }
    }
  }
  catch (err) {
    console.error('[SSR] Error fetching pool data:', err)
    error = 'Failed to load pool data'
  }

  if (error !== null || poolData === null) {
    return (
      <AppShell
        header={{
          backButton: true,
          title: 'Pool Not Found',
        }}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Pool Not Found</h1>
            <p className="text-gray-600">{error !== null ? error : 'The pool you\'re looking for doesn\'t exist.'}</p>
          </div>
        </div>
      </AppShell>
    )
  }

  // Transform to UI format
  const poolItem = transformPoolDataToUI(poolData, id) as App.PoolItem

  return (
    <AppShell
      header={{
        backButton: true,
        title: poolItem.name,
      }}
    >
      <PoolDetails poolData={poolData} poolItem={poolItem} />
    </AppShell>
  )
}
