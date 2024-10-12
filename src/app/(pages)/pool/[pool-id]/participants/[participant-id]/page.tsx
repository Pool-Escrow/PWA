'use client'

import { useEffect, useRef, useState } from 'react'
import { usePayoutStore } from '@/app/_client/stores/payout-store'

import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { formatAddress } from '@/app/_lib/utils/addresses'
import { cn } from '@/lib/utils/tailwind'
import frog from '@/public/app/images/frog.png'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { formatUnits, getAbiItem, parseUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTokenDecimals } from '@/app/(pages)/profile/send/_components/use-token-decimals'
import { usePoolDetails } from '../../ticket/_components/use-pool-details'
import useSmartTransaction from '@/app/_client/hooks/use-smart-transaction'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { useUserDetails } from '../_components/use-user-details'
import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getAdminStatusAction } from '@/app/(pages)/pools/actions'

const ParticipantPayout = ({ params }: { params: { 'pool-id': string; 'participant-id': Address } }) => {
    const { data: userDetails } = useUserDetails(params['participant-id'])
    const { poolDetails } = usePoolDetails(BigInt(params?.['pool-id']))

    const tokenAddress = poolDetails?.poolDetailFromSC?.[4] ?? currentTokenAddress

    const { tokenDecimalsData } = useTokenDecimals(tokenAddress)
    const { data: hash, isPending, isSuccess } = useWriteContract()
    const { executeTransactions } = useSmartTransaction()

    const { addPayout, getPayoutForParticipant } = usePayoutStore()

    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputValue, setInputValue] = useState<string>('0')
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const onSaveButtonClicked = () => {
        const amount = parseUnits(inputValue, tokenDecimalsData?.tokenDecimals)

        const poolId = params['pool-id']
        const participantAddress = params['participant-id']

        addPayout(poolId.toString(), { amount: amount.toString(), participantAddress })
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
                args: [BigInt(params['pool-id']), params['participant-id'], winnerAmount],
            },
        ]

        console.log('executeTransactions', args, params['pool-id'], params['participant-id'], winnerAmount)

        try {
            executeTransactions(args)
        } catch (error) {
            console.log('setWinner Error', error)
        }
    }

    useEffect(() => {
        const poolId = BigInt(params['pool-id'])
        const participantAddress = params['participant-id']
        const savedPayout = getPayoutForParticipant(poolId.toString(), participantAddress)
        if (savedPayout) {
            setInputValue(formatUnits(BigInt(savedPayout.amount), tokenDecimalsData?.tokenDecimals).toString())
        }
    }, [params, getPayoutForParticipant])

    useEffect(() => {
        getAdminStatusAction().then(isUserAdmin => {
            setIsAdmin(isUserAdmin)
        })
    }, [getAdminStatusAction])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Payout Successful', { description: `Transaction: ${hash}` })
        }
    }, [isPending, hash, isSuccess])

    const avatar = userDetails?.avatar ?? frog.src
    const displayName = userDetails?.displayName ?? formatAddress(params['participant-id'])

    if (!isAdmin) {
        return <div className={'mt-4 w-full text-center'}>You are not authorized to create a payout.</div>
    }

    return (
        <div className='max-w-md overflow-hidden rounded-lg bg-white'>
            <div className='mt-6 flex flex-col items-center'>
                <Avatar className='size-[73px]' aria-label='User Avatar'>
                    <AvatarImage alt='User Avatar' src={avatar} />
                    <AvatarFallback className='bg-[#d9d9d9]' />
                </Avatar>
                <div className='flex flex-row'>
                    <h3 className='flex h-10 flex-1 flex-row items-center justify-center font-semibold'>
                        {displayName}
                    </h3>
                </div>
                <div className='mb-4 flex flex-row justify-center'>
                    <p>Checked in</p>
                </div>
                <div className='mt-2 flex h-16 flex-row justify-center'>
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
                <div className='mt-8 flex w-full flex-col items-center justify-center space-y-2'>
                    <Button
                        onClick={onPayoutButtonClicked}
                        className='mb-3 h-[46px] w-full flex-1 grow flex-row items-center justify-center rounded-[2rem] bg-cta py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        Payout
                    </Button>
                    <Button
                        onClick={onSaveButtonClicked}
                        className='mb-3 h-[46px] w-full flex-1 grow flex-row items-center justify-center rounded-[2rem] py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ParticipantPayout
