'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useCreatePool } from './use-create-pool'
import { FormFieldKey, formFields } from './form-fields'
import { Button } from '@/app/_components/ui/button'
import { Label } from '@/app/_components/ui/label'
import { Steps, usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export default function CreatePoolForm() {
    const { formAction, state, createPoolOnChain, isPending, isConfirming } = useCreatePool()
    const { setBottomBarContent, setTopBarTitle, setTransactionInProgress } = useAppStore(s => ({
        setBottomBarContent: s.setBottomBarContent,
        setTopBarTitle: s.setTopBarTitle,
        setTransactionInProgress: s.setTransactionInProgress,
    }))
    const hasCreatedPool = useRef(false)

    const { setStep, showToast } = usePoolCreationStore(state => ({
        setStep: state.setStep,
        showToast: state.showToast,
    }))

    const { pending } = useFormStatus()

    const handleSubmit = useCallback(() => {
        setStep(Steps.CreatingDB)
        showToast()
    }, [setStep, showToast])

    useEffect(() => {
        setTopBarTitle('Create Pool')
        setBottomBarContent(
            <Button
                type='submit'
                form='pool-form'
                disabled={pending || isPending || isConfirming}
                className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                onClick={handleSubmit}>
                {pending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {pending
                    ? 'Submitting...'
                    : isPending
                      ? 'Creating in DB...'
                      : isConfirming
                        ? 'Confirming on-chain...'
                        : 'Create Pool'}
            </Button>,
        )

        setTransactionInProgress(isPending || isConfirming)

        return () => {
            setTopBarTitle(null)
            setBottomBarContent(null)
        }
    }, [setBottomBarContent, setTopBarTitle, setTransactionInProgress, isPending, isConfirming, handleSubmit, pending])

    useEffect(() => {
        console.log(
            'state.message:',
            state.message,
            'state.internalPoolId:',
            state.internalPoolId,
            'hasCreatedPool.current:',
            hasCreatedPool.current,
        )
        if (state.message === 'Pool created successfully' && state.internalPoolId && !hasCreatedPool.current) {
            hasCreatedPool.current = true
            createPoolOnChain()
            console.log('createPoolOnChain called, current state:', state)
        }
        if (state.message?.includes('Error')) {
            console.log('Pool creation failed:', state.message)
        }
    }, [state.message, state.internalPoolId, createPoolOnChain])

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
