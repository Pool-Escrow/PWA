'use client'

import { useAccount, useBalance } from 'wagmi'

import { useUserStore } from '@/stores/profile.store'

import { useRouter } from 'next/navigation'

import Container from '@/components/common/other/container'
import SectionContent from '@/components/common/other/section-content'

import { useEffect, useState } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { Address } from 'viem'
import { drop } from 'lodash'
import { dropletAddress } from '@/types/droplet'
import { wagmi } from '@/providers/configs'
import { useTokenDecimals } from '@/lib/hooks/use-token-decimals'
import OnRampDialog from '@/components/common/dialogs/onramp.dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/tailwind'

export default function ProfileBalanceSection() {
    const { wallets } = useWallets()

    const { data: tokenBalanceData } = useBalance({
        address: wallets[0]?.address as Address,
        token: dropletAddress[wagmi.config.state.chainId as ChainId],
    })

    const decimals = BigInt(tokenBalanceData?.decimals ?? BigInt(18))
    const tokenBalance = ((tokenBalanceData?.value ?? BigInt(0)) / BigInt(10) ** decimals).toString()
    const [openOnRampDialog, setOpenOnRampDialog] = useState(false)

    return (
        <Container>
            <SectionContent>
                <div className='mx-2 flex flex-col justify-center'>
                    <h3 className='text-[11pt] font-semibold text-black'>Total Balance</h3>
                    <h3 className='mb-4 text-[36pt] font-bold text-[#2785EA]'>
                        <span>{'$' + tokenBalance + ` `}</span>
                        <span className='text-[14pt]'>USDC</span>
                    </h3>
                    <div className='flex w-full flex-row gap-x-4'>
                        <Button
                            className='mb-3 h-[40px] w-full rounded-lg bg-cta px-6 py-[11px] text-center text-base text-sm font-medium leading-normal text-white shadow-button active:shadow-button-push'
                            onClick={(e: any) => {
                                setOpenOnRampDialog(true)
                            }}>
                            Deposit
                        </Button>
                        <Button className='mb-3 h-[40px] w-full rounded-lg bg-cta px-6 py-[11px] text-center text-base text-sm font-medium leading-normal text-white shadow-button active:shadow-button-push'>
                            Withdraw
                        </Button>
                    </div>

                    <OnRampDialog
                        open={openOnRampDialog}
                        setOpen={setOpenOnRampDialog}
                        balance={tokenBalanceData?.value}
                        decimalPlaces={decimals}
                    />
                </div>
            </SectionContent>
        </Container>
    )
}
