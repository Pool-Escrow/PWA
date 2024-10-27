'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { formatAddress } from '@/app/_lib/utils/addresses'
import { cn } from '@/lib/utils/tailwind'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { getAbiItem, parseUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTokenDecimals } from '@/app/(pages)/profile/send/_components/use-token-decimals'
import { usePoolDetails } from '../../ticket/_components/use-pool-details'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { useUserDetails } from '../_components/use-user-details'
import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import { blo } from 'blo'

type Props = {
    params: {
        'pool-id': string
        'participant-id': Address
    }
}

const ParticipantPayout = ({ params }: Props) => {
    const { 'participant-id': participantId, 'pool-id': poolId } = params
    const { data: userDetails } = useUserDetails(participantId)
    const { poolDetails } = usePoolDetails(poolId)

    const tokenAddress = poolDetails?.poolDetailFromSC?.[4] ?? currentTokenAddress

    const { tokenDecimalsData } = useTokenDecimals(tokenAddress)
    const { data: hash, isPending, isSuccess } = useWriteContract()
    const { executeTransactions } = useTransactions()

    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputValue, setInputValue] = useState<string>('0')
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const onPayoutButtonClicked = () => {
        const SetWinnerFunction = getAbiItem({
            abi: poolAbi,
            name: 'setWinner',
        })
        console.log('tokenDecimals', tokenDecimalsData.tokenDecimals)
        const winnerAmount = parseUnits(inputValue, tokenDecimalsData.tokenDecimals)

        const args = [
            {
                address: currentPoolAddress,
                abi: [SetWinnerFunction],
                functionName: SetWinnerFunction.name,
                args: [BigInt(poolId), participantId, winnerAmount],
            },
        ]

        console.log('executeTransactions', args, poolId, participantId, winnerAmount)

        try {
            executeTransactions(args)
        } catch (error) {
            console.log('setWinner Error', error)
        }
    }

    useEffect(() => {
        getUserAdminStatusActionWithCookie().then(isUserAdmin => {
            setIsAdmin(isUserAdmin)
        })
    }, [])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Payout Successful', { description: `Transaction: ${hash}` })
        }
    }, [isPending, hash, isSuccess])

    const avatar = userDetails?.avatar ?? blo(participantId)
    const displayName = userDetails?.displayName ?? formatAddress(participantId)

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
                </div>
            </div>
        </div>
    )
}

export default ParticipantPayout
