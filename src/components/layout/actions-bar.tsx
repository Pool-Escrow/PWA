'use client'

import type { MoonpayCurrencyCode, MoonpayPaymentMethod } from '@privy-io/react-auth'
import type { StaticIconProps } from '@/components/ui/icon'
import { useFundWallet, usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'

interface ActionItem {
  id: string
  label: string
  icon: (props: StaticIconProps) => React.JSX.Element
  alt: string
  onClick: () => void
}

export default function ActionsBar() {
  const router = useRouter()
  const { login, authenticated, ready } = usePrivy()
  const { fundWallet } = useFundWallet()
  const { wallets } = useWallets()

  const handleWithdraw = () => {
    if (!ready)
      return
    if (!authenticated) {
      login()
      return
    }
    router.push('/profile/send')
  }

  const handleDeposit = () => {
    if (!ready)
      return
    const fundWalletConfig = {
      currencyCode: 'USDC_BASE' as MoonpayCurrencyCode,
      quoteCurrencyAmount: 10,
      paymentMethod: 'credit_debit_card' as MoonpayPaymentMethod,
    }
    if (!authenticated) {
      login()
      return
    }
    void fundWallet(wallets[0].address, { config: fundWalletConfig })
  }

  const handlePayRequest = () => {
    if (!ready)
      return
    if (!authenticated) {
      login()
      return
    }
    router.push('/qr')
  }

  const handleBridge = () => {
    if (!ready)
      return
    if (!authenticated) {
      login()
      return
    }
    router.push('/profile/cross-swap')
  }

  const actions: ActionItem[] = [
    {
      id: 'pay-request',
      label: 'Pay/Request',
      icon: Icon.qr,
      alt: 'QR Code',
      onClick: handlePayRequest,
    },
    {
      id: 'deposit',
      label: 'Deposit',
      icon: Icon.wallet,
      alt: 'Deposit',
      onClick: handleDeposit,
    },
    {
      id: 'bridge',
      label: 'Bridge',
      icon: Icon.swap,
      alt: 'Bridge',
      onClick: handleBridge,
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: Icon.withdraw,
      alt: 'Withdraw',
      onClick: handleWithdraw,
    },
  ]

  return (
    <div className="short-dividers my-7 flex w-full">
      {actions.map(action => (
        <Button
          variant="ghost"
          key={action.id}
          onClick={action.onClick}
          className={`
            relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-none
            bg-transparent p-0
            hover:bg-transparent
            focus:bg-transparent
            active:bg-transparent
          `}
        >
          <action.icon className="size-6 text-white" />
          <span className="text-center text-2xs leading-tight font-semibold break-words text-white">
            {action.label}
          </span>
        </Button>
      ))}
    </div>
  )
}
