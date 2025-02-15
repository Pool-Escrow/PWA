'use client'

import { useWallets } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { useBalance } from 'wagmi'
import Container from '../../claim-winning/_components/container'
import SectionContent from '../../claim-winning/_components/section-content'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'

export default function ProfileBalanceSection() {
    const { wallets } = useWallets()

    const { data: tokenBalanceData } = useBalance({
        address: wallets[0]?.address as Address,
        token: currentTokenAddress,
    })

    const decimals = BigInt(tokenBalanceData?.decimals ?? BigInt(18))
    const tokenBalance = ((tokenBalanceData?.value ?? BigInt(0)) / BigInt(10) ** decimals).toString()

    return (
        <Container>
            <SectionContent>
                <div className='mx-2 flex flex-col  justify-center'>
                    <h3 className='text-[11pt] font-semibold text-black'>Total Balance</h3>
                    <h3 className='text-[36pt] font-bold text-[#4078FA]'>
                        <span>{'$' + tokenBalance + ` `}</span>
                        <span className='text-[14pt]'>USDC</span>
                    </h3>
                    {/* <div className='flex w-full flex-row gap-x-4'>
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
                    </div> */}

                    {/* <OnRampDialog
                        open={openOnRampDialog}
                        setOpen={setOpenOnRampDialog}
                        balance={tokenBalanceData?.value}
                        decimalPlaces={decimals}
                    /> */}
                </div>
            </SectionContent>
        </Container>
    )
}
