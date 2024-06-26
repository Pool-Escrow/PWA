'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/common/forms/image-uploader.control'
import { Text } from '@/components/common/forms/text.control'
import { DateTimeRange, DateTimeRangeValue } from '@/components/common/forms/date-time-range.control'
import { TextArea } from '@/components/common/forms/text-area.control'
import { CurrencyAmount } from '@/components/common/forms/currency-amount.control'
import { Number } from '@/components/common/forms/number.control'
import { Url } from '@/components/common/forms/url.control'
import { Database } from '@/types/db'
import { createPoolAction, updatePoolStatus } from './action'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { usePoolStore } from '@/stores/pool.store'
import { usePrivy } from '@privy-io/react-auth'
import { dropletAddress, poolAbi, poolAddress } from '@/types/contracts'
import { wagmi } from '@/providers/configs'
import { getAbiItem, parseEther } from 'viem'

type Pool = Database['public']['Tables']['pools']['Insert']

interface FormField {
    name: keyof Pool
    label: string
    description: string
    component: React.ComponentType<any>
    value: any
    setValue: (value: any) => void
}

const PoolDateTimeRange = ({
    value,
    setValue,
}: {
    value: { startDate: string; endDate: string }
    setValue: (value: { startDate: string; endDate: string }) => void
}) => {
    const [dateRangeValue, setDateRangeValue] = useState<DateTimeRangeValue>({
        start: value.startDate,
        end: value.endDate,
    })

    return <DateTimeRange value={dateRangeValue} setValue={setDateRangeValue} />
}

export default function CreatePoolPage() {
    const [formFields, setFormFields] = useState<FormField[]>([])
    const [dateRange, setDateRange] = useState<DateTimeRangeValue>({
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    const router = useRouter()
    const { showBar, setContent } = useBottomBarStore(state => state)
    const { draftPool, setDraftPool } = usePoolStore()
    const { user } = usePrivy()
    const queryClient = useQueryClient()
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

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
            queryClient.invalidateQueries(
                {
                    queryKey: ['pools'],
                    exact: true,
                    refetchType: 'active',
                },
                { throwOnError: true },
            )
            setDraftPool(null)
            router.push(`/pool/${createdPool.contract_id}`)
        },
        onError: error => {
            console.error('createPoolMutation Error:', error)
            toast.error('Failed to create pool', { description: 'Please try again' })
        },
    })

    const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const poolData = formFields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {}) as Omit<
            Pool,
            'internal_id' | 'createdAt' | 'updatedAt' | 'contract_id' | 'status'
        >
        const creatingToastId = toast.loading('Creating Pool', { description: 'Please wait...' })
        try {
            await createPoolMutation.mutateAsync(poolData)
        } finally {
            toast.dismiss(creatingToastId)
        }
    }

    useEffect(() => {
        // Move pool from pending to inactive.
        if (isConfirmed && hash) {
            const updatePoolToastId = toast.loading('Updating Pool', { description: 'Finalizing pool creation...' })
            updatePoolStatus(createPoolMutation.data?.internal_id.toString() ?? '', 'inactive')
                .then(() => {
                    toast.success('Pool Created Successfully', { description: 'Redirecting to pool details...' })
                    queryClient.invalidateQueries({ queryKey: ['pools'] })
                    setDraftPool(null)
                    router.push(`/pool/${createPoolMutation.data?.internal_id}`)
                })
                .catch(error => {
                    console.error('Error updating pool:', error)
                    toast.error('Failed to finalize pool creation', { description: 'Please contact support' })
                })
                .finally(() => {
                    toast.dismiss(updatePoolToastId)
                })
        }
    }, [isConfirmed, hash, createPoolMutation.data])

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
    }, [setContent, showBar, isPending, isConfirming])

    useEffect(() => {
        setFormFields([
            {
                name: 'bannerImage',
                label: 'Choose Image',
                description: 'Update a banner photo; ideal aspect ratio is 2:1',
                component: ImageUploader,
                value: draftPool?.image || '',
                setValue: v => setFormFields(prev => updateField(prev, 0, v)),
            },
            {
                name: 'name',
                label: 'Name of Pool',
                description: 'Enter a name for your Pool',
                component: Text,
                value: draftPool?.name || '',
                setValue: v => setFormFields(prev => updateField(prev, 1, v)),
            },
            // TODO: clarify on this
            // {
            //     // currently is the creator so no need to fill in the form
            //     name: 'hostname',
            //     label: 'Name of Host',
            //     description: 'Enter the host name',
            //     component: Text,
            //     value: draftPool?.hostName || '',
            //     setValue: v => setFormFields(prev => updateField(prev, 2, v)),
            // },
            // TODO: needs review
            // {
            //     name: 'co_host_addresses',
            //     label: 'Add Co-Host',
            //     description: 'Please add your Co-Host',
            //     component: MultiSelect,
            //     value: draftPool?.coHosts || [],
            //     setValue: v => setFormFields(prev => updateField(prev, 3, v)),
            // },
            // TODO: needs review
            // {
            //     name: 'startDate',
            //     label: 'Date of Event',
            //     description: 'Select the start and end date and time of the Pool',
            //     component: DateTimeRange,
            //     value: draftPool?.dateRange || {
            //         start: new Date().toISOString(),
            //         end: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
            //       },
            //     setValue: v => setFormFields(prev => updateField(prev, 4, v)),
            // },
            {
                name: 'startDate',
                label: 'Date of Event',
                description: 'Select the start and end date and time of the Pool',
                component: PoolDateTimeRange,
                value: {
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
                setValue: (newValue: { startDate: string; endDate: string }) => {
                    setFormFields(prev => {
                        const newFields = [...prev]
                        const startDateIndex = newFields.findIndex(field => field.name === 'startDate')
                        const endDateIndex = newFields.findIndex(field => field.name === 'endDate')

                        if (startDateIndex !== -1) {
                            newFields[startDateIndex] = { ...newFields[startDateIndex], value: newValue.startDate }
                        }
                        if (endDateIndex !== -1) {
                            newFields[endDateIndex] = { ...newFields[endDateIndex], value: newValue.endDate }
                        }

                        return newFields
                    })
                },
            },
            {
                name: 'description',
                label: 'Description',
                description: 'Enter a description for your Pool',
                component: TextArea,
                value: draftPool?.description || '',
                setValue: v => setFormFields(prev => updateField(prev, 5, v)),
            },
            {
                name: 'price',
                label: 'Price',
                description: 'What is the price to participate in the Pool?',
                component: CurrencyAmount,
                value: draftPool?.price || '',
                setValue: v => setFormFields(prev => updateField(prev, 6, v)),
            },
            {
                name: 'softCap',
                label: 'Soft Cap',
                description: 'Enter the max amount of paid entries allowed to join',
                component: Number,
                value: draftPool?.softCap || '',
                setValue: v => setFormFields(prev => updateField(prev, 7, v)),
            },
            {
                name: 'termsURL',
                label: 'Link To Rules, Terms, and Conditions',
                description: 'Paste a link to your rules',
                component: Url,
                value: draftPool?.rulesUrl || '',
                setValue: v => setFormFields(prev => updateField(prev, 8, v)),
            },
        ])
    }, [])

    const updateField = (prev: FormField[], index: number, value: any) => {
        const newFields = [...prev]
        newFields[index] = { ...newFields[index], value }
        return newFields
    }

    return (
        <form className='flex w-full flex-col gap-6 py-6' onSubmit={handleFormSubmission}>
            <section className='flex flex-1 flex-col gap-6'>
                {formFields.map((field, index) => (
                    <div key={index}>
                        <Label className='text-base font-medium text-[#090909]'>{field.label}</Label>
                        <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>
                        <field.component value={field.value} setValue={field.setValue} />
                    </div>
                ))}
            </section>
        </form>
    )
}
