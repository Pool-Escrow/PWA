'use client'

import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { PoolDraft, useCreatePoolStore } from '@/stores/create-pool.store'
import { useEffect, useState } from 'react'
import { CurrencyAmount } from '../common/forms/currency-amount.control'
import { DateTimeRange } from '../common/forms/date-time-range.control'
import { ImageUploader } from '../common/forms/image-uploader.control'
import { Number as NumberControl } from '../common/forms/number.control'
import { TextArea } from '../common/forms/text-area.control'
import { Text } from '../common/forms/text.control'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Database } from '@/types/db'
import { usePrivy } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useWallets } from '@privy-io/react-auth'
import { useSponsoredTxn } from '@/hooks/use-sponsored-txn'
import { createPoolAction, updatePoolStatus } from './action'
import { toast } from 'sonner'
import { decodeEventLog, getAbiItem, parseEther } from 'viem'
import { poolAbi, poolAddress } from '@/types/contracts'
import { dropletAddress } from '@/types/droplet'
import { wagmi } from '@/providers/configs'
import { useRouter } from 'next/navigation'
import { Route } from 'next'

type Pool = Database['public']['Tables']['pools']['Insert']

type DraftPoolKey = keyof PoolDraft

type CreatePoolData = Omit<Pool, 'internal_id' | 'createdAt' | 'updatedAt' | 'contract_id' | 'status'>

type InputComponent = React.ComponentType<{
    value: any
    setValue: (value: any) => void
}>

const formFields: Array<{
    key: DraftPoolKey
    label: string
    description: string
    component: InputComponent
}> = [
    {
        key: 'bannerImage',
        label: 'Choose Image',
        description: 'Update a banner photo; ideal aspect ratio is 2:1',
        component: ImageUploader,
    },
    {
        key: 'name',
        label: 'Name of Pool',
        description: 'Enter a name for your Pool',
        component: Text,
    },
    {
        key: 'dateRange',
        label: 'Date of Event',
        description: 'Select the start and end date and time of the Pool',
        component: DateTimeRange,
    },
    {
        key: 'description',
        label: 'Description',
        description: 'Enter a description for your Pool',
        component: TextArea,
    },
    {
        key: 'price',
        label: 'Buy in',
        description: 'What is the price to participate in the Pool?',
        component: CurrencyAmount,
    },
    {
        key: 'softCap',
        label: 'Soft Cap',
        description: 'Enter the max amount of paid entries allowed to join',
        component: NumberControl,
    },
    {
        key: 'termsURL',
        label: 'Link To Rules, Terms, and Conditions',
        description: 'Paste a link to your rules',
        component: Text,
    },
]

export default function CreatePool() {
    const { draftPool, setDraftPool, resetDraftPool } = useCreatePoolStore()
    const [isClient, setIsClient] = useState(false)

    const { showBar, setContent } = useBottomBarStore(state => state)
    const { user } = usePrivy()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: hash, isPending, writeContract } = useWriteContract()
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        data: receipt,
    } = useWaitForTransactionReceipt({
        hash,
    })
    const { wallets } = useWallets()
    const { sponsoredTxn } = useSponsoredTxn()

    const createPoolMutation = useMutation({
        mutationFn: async (
            poolData: Omit<Pool, 'internal_id' | 'createdAt' | 'updatedAt' | 'contract_id' | 'status'>,
        ) => createPoolAction(poolData),

        onSuccess: createdPool => {
            toast.info('Creating Pool on-chain', { description: 'Initiating blockchain transaction...' })

            if (writeContract) {
                const timeStart = Math.floor(new Date(createdPool.startDate).getTime() / 1000)
                const timeEnd = Math.floor(new Date(createdPool.endDate).getTime() / 1000)

                const CreatePoolFunction = getAbiItem({
                    abi: poolAbi,
                    name: 'createPool',
                })
                if (wallets[0].walletClientType === 'coinbase_smart_wallet' || wallets[0].walletClientType === 'coinbase_wallet') {
                    sponsoredTxn([{
                        address: poolAddress[wagmi.config.state.chainId as ChainId],
                        abi: [CreatePoolFunction],
                        functionName: 'createPool',
                        args: [
                            timeStart,
                            timeEnd,
                            createdPool.name,
                            parseEther(createdPool.price.toString()),
                            1000, // penaltyFeeRate, assuming 10% (1000 basis points), adjust as needed
                            //TODO: change to usdc/ flexible token
                            dropletAddress[wagmi.config.state.chainId as ChainId],
                        ],
                    }])
                } else {
                    writeContract({
                        address: poolAddress[wagmi.config.state.chainId as ChainId],
                        abi: [CreatePoolFunction],
                        functionName: 'createPool',
                        args: [
                            timeStart,
                            timeEnd,
                            createdPool.name,
                            parseEther(createdPool.price.toString()),
                            1000, // penaltyFeeRate, assuming 10% (1000 basis points), adjust as needed
                            //TODO: change to usdc/ flexible token
                            dropletAddress[wagmi.config.state.chainId as ChainId],
                        ],
                    })
                }
            }
            queryClient.invalidateQueries(
                {
                    queryKey: ['pools'],
                    exact: true,
                    refetchType: 'active',
                },
                { throwOnError: true },
            )
        },
        onError: error => {
            console.error('createPoolMutation Error:', error)
            toast.error('Failed to create pool', { description: 'Please try again' })
        },
    })

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        const submitButton = (
            <Button
                type='submit'
                disabled={isPending || isConfirming}
                className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                onClick={() => document.querySelector('form')?.requestSubmit()}>
                {isPending ? 'Confirming...' : isConfirming ? 'Creating...' : 'Create Pool'}
            </Button>
        )
        setContent(submitButton)
        showBar()
    }, [])

    useEffect(() => {
        if (isConfirmed && receipt) {
            // Buscar el evento PoolCreated en los logs
            const poolCreatedLog = receipt.logs.find(
                log => log.topics[0] === '0x62cf78dd3c1528a147e40a8e7413f29c3deed8603e2ee1d0c5284b052dae7221',
            )

            if (poolCreatedLog) {
                const decodedLog = decodeEventLog({
                    abi: poolAbi,
                    data: poolCreatedLog.data,
                    topics: poolCreatedLog.topics,
                })

                // Extraer el latestPoolId del evento decodificado
                // @ts-expect-error
                const latestPoolId = Number(decodedLog.args.poolId)

                console.log('Latest Pool ID:', latestPoolId)

                const updatePoolToastId = toast.loading('Updating Pool', { description: 'Finalizing pool creation...' })
                const internalId = createPoolMutation.data?.internal_id.toString()

                if (!internalId) {
                    console.error('Internal ID not found in createPoolMutation.data:', createPoolMutation.data)
                    toast.error('Failed to finalize pool creation', { description: 'Please contact support' })
                    return
                }

                updatePoolStatus(internalId, 'inactive', latestPoolId)
                    .then(() => {
                        toast.success('Pool Created Successfully', { description: 'Redirecting to pool details...' })
                        queryClient.invalidateQueries({ queryKey: ['pools'] })
                        resetDraftPool()
                        router.push(`/pool/${latestPoolId}` as Route)
                    })
                    .catch(error => {
                        console.error('Error updating pool:', error)
                        toast.error('Failed to finalize pool creation', { description: 'Please contact support' })
                    })
                    .finally(() => {
                        toast.dismiss(updatePoolToastId)
                    })
            } else {
                console.error('PoolCreated event not found in transaction logs')
                toast.error('Failed to retrieve pool ID', { description: 'Please contact support' })
            }
        }
    }, [isConfirmed, receipt, createPoolMutation.data])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('submitting form with values:', draftPool)

        const missingFields = []
        if (!draftPool.name) missingFields.push('Name')
        if (!draftPool.description) missingFields.push('Description')
        if (!draftPool.bannerImage) missingFields.push('Banner Image')
        if (!draftPool.termsURL) missingFields.push('Terms URL')
        if (!draftPool.softCap) missingFields.push('Soft Cap')
        if (!draftPool.price) missingFields.push('Price')
        if (!draftPool.dateRange?.start) missingFields.push('Start Date')
        if (!draftPool.dateRange?.end) missingFields.push('End Date')

        if (missingFields.length > 0) {
            const missingFieldsString = missingFields.join(', ')
            toast.error('Missing required fields', {
                description: `Please fill in the following fields:
                ${missingFieldsString}.`,
            })
            return
        }

        const poolData: CreatePoolData = {
            name: draftPool.name,
            description: draftPool.description,
            bannerImage: draftPool.bannerImage,
            termsURL: draftPool.termsURL,
            softCap: parseInt(draftPool.softCap, 10),
            startDate: draftPool.dateRange.start,
            endDate: draftPool.dateRange.end,
            price: parseFloat(draftPool.price),
            tokenAddress: dropletAddress[wagmi.config.state.chainId as ChainId],
        }

        const creatingToastId = toast.loading('Creating Pool', { description: 'Please wait...' })
        try {
            await createPoolMutation.mutateAsync(poolData)
        } catch (error) {
            console.error('Error creating pool:', error)
            toast.error('Failed to create pool', { description: 'An unexpected error occurred. Please try again.' })
        } finally {
            toast.dismiss(creatingToastId)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex w-full flex-col gap-6 py-6'>
            {formFields.map(({ key, label, description, component: Component }) => (
                <section key={key} className='flex flex-1 flex-col'>
                    <Label className='text-base font-medium text-[#090909]'>{label}</Label>
                    <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{description}</p>
                    {isClient ? (
                        key === 'dateRange' ? (
                            <DateTimeRange value={draftPool[key]} setValue={value => setDraftPool(key, value)} />
                        ) : (
                            <Component value={draftPool[key]} setValue={value => setDraftPool(key, value)} />
                        )
                    ) : (
                        <div>Loading...</div>
                    )}
                </section>
            ))}
        </form>
    )
}
