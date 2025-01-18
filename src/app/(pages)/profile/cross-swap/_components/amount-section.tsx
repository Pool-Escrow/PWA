'use client'

import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import Container from '../../claim-winning/_components/container'
import SectionContent from '../../claim-winning/_components/section-content'
import { useTokenDecimals } from './use-token-decimals'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { useTransferToken } from './use-transfer-tokens'

export default function AmountSection() {
    const [amount, setAmount] = useState('')
    const [withdrawAddress, setWithdrawAddress] = useState('')

    const handleAmountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value)
    }
    const handleWithdrawAddressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWithdrawAddress(event.target.value)
    }
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    const isRouting = useAppStore(state => state.isRouting)

    const { tokenDecimalsData } = useTokenDecimals(currentTokenAddress)
    const { transferToken, isSuccess, setIsSuccess } = useTransferToken()

    const onWithdrawButtonClicked = (amount: string, withdrawAddress: string) => {
        void transferToken(
            withdrawAddress as Address,
            BigInt(Number(amount) * Math.pow(10, Number(tokenDecimalsData?.tokenDecimals ?? 0))),
        )
    }

    useEffect(() => {
        if (!isRouting) {
            setBottomBarContent(
                <Button
                    onClick={() => onWithdrawButtonClicked(amount, withdrawAddress)}
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    <span>Withdraw</span>
                </Button>,
            )
        }
    }, [amount, withdrawAddress, isRouting])

    useEffect(() => {
        if (isSuccess) {
            setAmount('')
            setWithdrawAddress('')
            setIsSuccess(false)
        }
    }, [isSuccess, setIsSuccess])

    return (
        <div className='flex flex-col gap-y-3'>
            <Container>
                <SectionContent>
                    <div className='mx-2 flex flex-col justify-center'>
                        <h3 className='text-[11pt] font-semibold text-black'>Withdraw Amount</h3>
                        <h3 className='text-[36pt] font-bold text-[#2785EA]'>
                            <div className='flex items-center'>
                                <span className={`mr-[1px] ${amount ? 'text-black' : 'text-gray-400'}`}>$</span>
                                <Input
                                    value={amount}
                                    onChange={handleAmountInputChange}
                                    className='rounded-none border-none bg-transparent p-0 text-[36pt] font-bold caret-[#2785EA] outline-none ring-0 focus:border-none focus:outline-none focus:ring-0'
                                    type='number'
                                    placeholder='0'
                                />
                            </div>
                        </h3>
                    </div>
                </SectionContent>
            </Container>
            <Container>
                <SectionContent>
                    <div className='mx-2 flex flex-col justify-center'>
                        <h3 className='text-[11pt] font-semibold text-black'>Address to send amount to</h3>
                        <div className='mt-2 border-b border-gray-200'></div>
                        <h3 className='mb-[18px] text-[36pt] font-bold text-[#2785EA]'>
                            <Input
                                value={withdrawAddress}
                                onChange={handleWithdrawAddressInputChange}
                                className='h-12 text-sm [&::placeholder]:text-sm [&::placeholder]:font-normal'
                                placeholder='Paste address here'
                            />
                        </h3>
                        <p className='text-[12px] leading-[14px]'>
                            <span className='font-bold'>Important</span>: Only send to an ERC20 token wallet that
                            accepts USDC. Failure to do this will result in a{' '}
                            <span className='mx-1 font-bold'>loss</span>
                            of your funds. This transaction is not refundable.
                        </p>
                    </div>
                </SectionContent>
            </Container>
        </div>
    )
}
