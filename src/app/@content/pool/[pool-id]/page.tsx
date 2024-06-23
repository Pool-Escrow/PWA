/**
 * @file src/app/pool/[pool-id]/page.tsx
 * @description This file is the wrapper for the pool details page.
 */

import { PoolDetails } from '@/components/pool-details'

export default function Page({ params }: { params: { 'pool-id': string } }) {
    return <PoolDetails poolId={params['pool-id']} />
}
// export { PoolDetails as default } from '@/components/pool-details'
