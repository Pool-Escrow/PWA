'use client'

import { Icons } from '@/components/ui/icons'
import { useUser } from '@/hooks/use-user'
import { useUserBalances } from '@/hooks/use-user-balances'

export default function UserBalances() {
  const { data: user } = useUser()
  const { data, isLoading } = useUserBalances(user?.address)

  if (isLoading) {
    return <div>Loading balances...</div>
  }

  const { usdc, drop } = data?.balances ?? {
    usdc: { balance: 0, symbol: 'USDC' },
    drop: { balance: 0, symbol: 'DROP' },
  }

  return (
    <section className="flex flex-col text-white">
      <h1 className="text-sm font-semibold">Total balance</h1>
      <div className="flex items-baseline gap-2 text-[2.5rem] font-bold">
        <span>
          $
          {usdc.balance.toFixed(2)}
          <span className="ml-1 text-lg">{usdc.symbol}</span>
        </span>
      </div>
      <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white px-3 py-1.5">
        <Icons.drop className="size-4" />
        <span className="text-sm">{`Drop Tokens: ${drop.balance}`}</span>
      </div>
    </section>
  )
}
