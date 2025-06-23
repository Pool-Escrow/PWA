import type { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

export type PoolItem = {
    id: string
    name: string
    startDate: Date
    endDate: Date
    numParticipants: number
    status: POOLSTATUS | string
    image: string
    softCap: number
}
