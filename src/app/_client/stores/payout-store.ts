import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PayoutData = {
    amount: string // Changed to string to avoid BigInt serialization issues
    participantAddress: string
}

type PayoutStore = {
    payouts: Record<string, PayoutData[]>
    addPayout: (poolId: string, payoutData: PayoutData) => void
    getPayoutForParticipant: (poolId: string, participantAddress: string) => PayoutData | undefined
    clearPoolPayouts: (poolId: string) => void // New function
}

export const usePayoutStore = create<PayoutStore>()(
    persist(
        (set, get) => ({
            payouts: {},
            addPayout: (poolId, payoutData) =>
                set(state => {
                    const poolIdString = poolId.toString()
                    const currentPayouts = state.payouts[poolIdString] || []
                    let updatedPayouts = currentPayouts.filter(
                        p => p.participantAddress !== payoutData.participantAddress,
                    )
                    if (payoutData.amount !== '0') {
                        updatedPayouts.push(payoutData)
                    }
                    return {
                        payouts: {
                            ...state.payouts,
                            [poolIdString]: updatedPayouts,
                        },
                    }
                }),
            getPayoutForParticipant: (poolId, participantAddress) => {
                const state = get()
                const poolIdString = poolId.toString()
                const poolPayouts = state.payouts[poolIdString] || []
                return poolPayouts.find(p => p.participantAddress === participantAddress)
            },
            clearPoolPayouts: poolId =>
                set(state => {
                    const poolIdString = poolId.toString()
                    const { [poolIdString]: _, ...restPayouts } = state.payouts
                    return { payouts: restPayouts }
                }),
        }),
        {
            name: 'payout-storage',
        },
    ),
)
