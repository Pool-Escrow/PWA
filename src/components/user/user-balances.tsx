'use client'

import NumberFlow from '@number-flow/react'
import { useUserBalances } from '@/hooks/use-user-balances'
import Icon from '../ui/icon'

export default function UserBalances() {
  const { usdc, drop } = useUserBalances()

  return (
    <section className="flex flex-col text-white">
      <h1 className="text-sm font-semibold">Total balance</h1>
      <span>
        <NumberFlow
          className="text-2xl font-medium"
          value={usdc.balance}
          // trend={0}
          format={{
            currency: 'USD',
            useGrouping: false,
            style: 'currency',
          }}
          suffix="USDC"
          isolate
        />
      </span>

      <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white px-3 py-1.5">
        <Icon.drop className="size-4" />
        <span>Drop Tokens:</span>
        <NumberFlow
          className="text-sm"
          isolate
          value={drop.balance}
          format={{
            useGrouping: false,
          }}
        />
      </div>
    </section>
  )
}
