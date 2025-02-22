"use client"

import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { currentTokenAddress } from "@/app/_server/blockchain/server-config"
import { appActions, appStore$ } from "@/app/stores/app.store"
import { use$ } from "@legendapp/state/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Address } from "viem"
import Container from "../../claim-winning/_components/container"
import SectionContent from "../../claim-winning/_components/section-content"
import { useTokenDecimals } from "./use-token-decimals"
import { useTransferToken } from "./use-transfer-tokens"

export default function AmountSection() {
    const [amount, setAmount] = useState("")
    const [withdrawAddress, setWithdrawAddress] = useState("")
    const searchParams = useSearchParams()
    const isRouting = use$(appStore$.settings.isRouting)

    const handleAmountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value)
    }
    const handleWithdrawAddressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWithdrawAddress(event.target.value)
    }

    const { tokenDecimalsData } = useTokenDecimals(currentTokenAddress)
    const { transferToken, isSuccess, setIsSuccess } = useTransferToken()

    useEffect(() => {
        const addressParam = searchParams?.get("address")
        if (addressParam) {
            setWithdrawAddress(addressParam)
        }
    }, [searchParams])

    const onWithdrawButtonClicked = (amount: string, withdrawAddress: string) => {
        void transferToken(
            withdrawAddress as Address,
            BigInt(Number(amount) * Math.pow(10, Number(tokenDecimalsData?.tokenDecimals ?? 0))),
        )
    }

    useEffect(() => {
        if (!isRouting) {
            appActions.setBottomBarContent(
                <Button
                    onClick={() => onWithdrawButtonClicked(amount, withdrawAddress)}
                    className='pool-button shadow-button active:shadow-button-push mb-3 h-[46px] w-full rounded-[2rem] px-6 py-[11px] text-center text-base leading-normal font-semibold'>
                    <span>Withdraw</span>
                </Button>,
            )
        }
        return () => {
            appActions.setBottomBarContent(null)
        }
    }, [amount, withdrawAddress, isRouting])

    useEffect(() => {
        if (isSuccess) {
            setAmount("")
            setWithdrawAddress("")
            setIsSuccess(false)
        }
    }, [isSuccess, setIsSuccess])

    return (
        <div className='flex flex-col gap-y-3'>
            <Container>
                <SectionContent>
                    <div className='mx-2 flex flex-col justify-center'>
                        <h3 className='text-[11pt] font-semibold text-black'>Withdraw Amount</h3>
                        <h3 className='text-[36pt] font-bold text-[#4078FA]'>
                            <div className='flex items-center'>
                                <span className={`mr-px ${amount ? "text-black" : "text-gray-400"}`}>$</span>
                                <Input
                                    value={amount}
                                    onChange={handleAmountInputChange}
                                    className='rounded-none border-none bg-transparent p-0 text-[36pt] font-bold caret-[#4078FA] ring-0 outline-none focus:border-none focus:ring-0 focus:outline-none'
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
                        <div className='mt-2 border-b border-gray-200' />
                        <h3 className='mb-[18px] text-[36pt] font-bold text-[#4078FA]'>
                            <Input
                                value={withdrawAddress}
                                onChange={handleWithdrawAddressInputChange}
                                className='h-12 text-sm [&::placeholder]:text-sm [&::placeholder]:font-normal'
                                placeholder='Paste address here'
                            />
                        </h3>
                        <p className='text-[12px] leading-[14px]'>
                            <span className='font-bold'>Important</span>: Only send to an ERC20 token wallet that
                            accepts USDC. Failure to do this will result in a{" "}
                            <span className='mx-1 font-bold'>loss</span>
                            of your funds. This transaction is not refundable.
                        </p>
                    </div>
                </SectionContent>
            </Container>
        </div>
    )
}
