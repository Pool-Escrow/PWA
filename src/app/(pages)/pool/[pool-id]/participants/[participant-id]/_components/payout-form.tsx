'use client'

import { usePayoutStore } from '@/app/_client/stores/payout-store'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { cn } from '@/lib/utils/tailwind'

import { useTokenDecimals } from '@/app/(pages)/profile/send/_components/use-token-decimals'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { toast } from 'sonner'
import { Address, formatUnits, getAbiItem, parseUnits } from 'viem'
import { useWriteContract } from 'wagmi'

interface PayoutFormProps {
    poolId: string
    participantId: Address
    tokenAddress: Address
}

const PayoutForm: React.FC<PayoutFormProps> = ({ poolId, participantId, tokenAddress }) => {
    const { tokenDecimalsData } = useTokenDecimals(tokenAddress)
    const { data: hash, isPending, isSuccess } = useWriteContract()
    const { executeTransactions } = useTransactions()
    const { addPayout, getPayoutForParticipant } = usePayoutStore()

    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputValue, setInputValue] = useState<string>('')

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const onSaveButtonClicked = () => {
        const amount = parseUnits(inputValue, tokenDecimalsData?.tokenDecimals)
        addPayout(poolId.toString(), { amount: amount.toString(), participantAddress: participantId })
        toast.success('Payout saved successfully')
    }

    const onPayoutButtonClicked = () => {
        const SetWinnerFunction = getAbiItem({
            abi: poolAbi,
            name: 'setWinner',
        })
        const winnerAmount = parseUnits(inputValue, tokenDecimalsData?.tokenDecimals)

        const args = [
            {
                address: currentPoolAddress,
                abi: [SetWinnerFunction],
                functionName: SetWinnerFunction.name,
                args: [BigInt(poolId), participantId, winnerAmount],
            },
        ]

        try {
            executeTransactions(args)
        } catch (error) {
            console.log('setWinner Error', error)
        }
    }

    useEffect(() => {
        const savedPayout = getPayoutForParticipant(poolId.toString(), participantId)
        if (savedPayout) {
            setInputValue(formatUnits(BigInt(savedPayout.amount), tokenDecimalsData?.tokenDecimals).toString())
        }
    }, [poolId, participantId, getPayoutForParticipant, tokenDecimalsData?.tokenDecimals])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Payout Successful', { description: `Transaction: ${hash}` })
        }
    }, [isPending, hash, isSuccess])

    return (
        <>
            <div className='flex h-16 flex-row justify-center'>
                <div className='relative flex justify-center'>
                    <Input
                        className={cn('h-24 w-auto border-none text-center text-6xl font-bold focus:outline-none')}
                        placeholder='$'
                        autoFocus={true}
                        value={inputValue}
                        type='number'
                        onChange={handleInputChange}
                        ref={inputRef}
                        inputMode='numeric'
                    />
                </div>
            </div>
            <div className='mt-8 flex w-full flex-col items-center justify-center space-y-2 px-4 md:px-0'>
                <Button
                    disabled={inputValue === ''}
                    onClick={onPayoutButtonClicked}
                    className='mb-3 h-[46px] w-full flex-1 grow flex-row items-center justify-center rounded-[2rem] bg-cta py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    Payout
                </Button>
                <Button
                    disabled={inputValue === ''}
                    onClick={onSaveButtonClicked}
                    className='main_gradient mb-3 h-[46px] w-full flex-1 grow flex-row items-center justify-center rounded-[2rem] py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    Save
                </Button>
            </div>
        </>
    )
}

export default PayoutForm
