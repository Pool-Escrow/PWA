'use client'

import NumberFlow from '@number-flow/react'
import { useUserBalances } from '@/hooks/use-user-balances'
import Icon from '../ui/icon'

export default function UserBalances() {
  const { usdc, drop, isLoading, isError } = useUserBalances()

  // Show 0 only on error, otherwise show actual values (including during loading)
  const displayUsdc = isError ? 0 : usdc.balance
  const displayDrop = isError ? 0 : drop.balance

  return (
    <section className="flex flex-col text-white">
      <h1 className="text-sm font-semibold">Total balance</h1>
      <span>
        <NumberFlow
          className="text-4xl font-bold"
          value={displayUsdc}
          format={{
            currency: 'USD',
            useGrouping: false,
            style: 'currency',
          }}
          suffix="USDC"
          isolate={false}
        />
      </span>

      <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white px-3 py-1.5">
        <Icon.drop className="size-4" />
        <span>Drop Tokens:</span>
        <NumberFlow
          className="text-sm"
          isolate={false}
          value={displayDrop}
          format={{
            useGrouping: false,
          }}
        />
      </div>
    </section>
  )
}
