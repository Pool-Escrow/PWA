'use client'

import { Button } from '@/app/_components/ui/button'
import { Label } from '@/app/_components/ui/label'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { createPoolAction } from './actions'
import { useAppStore } from '@/app/_client/providers/app-store.provider'

// Dynamic imports for form components
const CurrencyAmount = dynamic(() => import('@/app/_components/forms-controls/currency-amount.control'), {
    ssr: false,
})
const DateTimeRange = dynamic(() => import('@/app/_components/forms-controls/date-time-range.control'), {
    ssr: false,
})
const ImageUploader = dynamic(() => import('@/app/_components/forms-controls/image-uploader.control'), {
    ssr: false,
})
const NumberControl = dynamic(() => import('@/app/_components/forms-controls/number.control'), { ssr: false })
const TextArea = dynamic(() => import('@/app/_components/forms-controls/text-area.control'), { ssr: false })
const Text = dynamic(() => import('@/app/_components/forms-controls/text.control'), { ssr: false })

// Form fields configuration
const formFields = [
    {
        key: 'bannerImage',
        name: 'bannerImage',
        label: 'Choose Image',
        description: 'Update a banner photo; ideal aspect ratio is 2:1',
        component: ImageUploader,
    },
    {
        key: 'name',
        name: 'name',
        label: 'Name of Pool',
        description: 'Enter a name for your Pool',
        component: Text,
    },
    {
        key: 'dateRange',
        name: 'dateRange',
        label: 'Date of Event',
        description: 'Select the start and end date and time of the Pool',
        component: DateTimeRange,
    },
    {
        key: 'description',
        name: 'description',
        label: 'Description',
        description: 'Enter a description for your Pool',
        component: TextArea,
    },
    {
        key: 'price',
        name: 'price',
        label: 'Buy in',
        description: 'What is the price to participate in the Pool?',
        component: CurrencyAmount,
    },
    {
        key: 'softCap',
        name: 'softCap',
        label: 'Soft Cap',
        description: 'Enter the max amount of paid entries allowed to join',
        component: NumberControl,
    },
    {
        key: 'termsURL',
        name: 'termsURL',
        label: 'Link To Rules, Terms, and Conditions',
        description: 'Paste a link to your rules',
        component: Text,
    },
] as const

type FormFieldKey = (typeof formFields)[number]['key']

const initialState = {
    message: '',
    errors: {
        bannerImage: [],
        name: [],
        dateRange: [],
        description: [],
        price: [],
        softCap: [],
        termsURL: [],
    },
    internalPoolId: undefined,
}

export default function CreatePool() {
    const [toastId, setToastId] = useState<string | number>()

    const { setBottomBarContent, setTopBarTitle } = useAppStore(s => ({
        setBottomBarContent: s.setBottomBarContent,
        setTopBarTitle: s.setTopBarTitle,
    }))

    // Use useFormState to handle form submission and state updates
    const [state, formAction] = useFormState(createPoolAction, initialState)
    const { pending } = useFormStatus()

    // Effect to handle toast notifications based on form submission result
    useEffect(() => {
        if (state?.message) {
            if (toastId) {
                toast.dismiss(toastId)
            }
            if (state.message !== 'Pool created successfully') {
                toast.error(state.message)
            } else {
                toast.success(state.message)
            }
            setToastId(undefined)
        }
    }, [state?.message, toastId])

    // Effect to set up the top bar title and bottom bar content
    useEffect(() => {
        setTopBarTitle('Create Pool')
        setBottomBarContent(
            <Button
                type='submit'
                form='pool-form'
                disabled={pending}
                className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                onClick={() => {
                    // TODO: disable button here immediately after click
                    setToastId(
                        toast.loading('Creating Pool', {
                            description: 'Please wait...',
                            dismissible: true,
                        }),
                    )
                }}>
                {pending ? 'Creating...' : 'Create Pool'}
            </Button>,
        )
        return () => {
            setTopBarTitle(null)
            setBottomBarContent(null)
        }
    }, [setBottomBarContent, setTopBarTitle, pending])

    // Render the form
    return (
        <form id='pool-form' action={formAction} className='flex w-full flex-col gap-6 py-6'>
            {formFields.map(field => {
                const errors = state?.errors && field.key in state.errors ? state.errors[field.key as FormFieldKey] : []

                return (
                    <section key={field.key} className='flex flex-1 flex-col'>
                        <Label className='text-base font-medium text-[#090909]'>{field.label}</Label>
                        <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>
                        <field.component name={field.name} />
                        {errors && errors.length > 0 && (
                            <p className='mt-1 text-xs text-red-500'>{errors.join(', ')}</p>
                        )}
                    </section>
                )
            })}
        </form>
    )
}
