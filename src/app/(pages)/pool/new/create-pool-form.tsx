'use client'

import { Steps, usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { Button } from '@/app/_components/ui/button'
import { Label } from '@/app/_components/ui/label'
import { appActions, appStore$ } from '@/app/stores/app.store'
import { use$ } from '@legendapp/state/react'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import RetryDialog from './_components/retry-dialog'
import { formFields } from './form-fields'
import { useCreatePool } from './use-create-pool'

export default function CreatePoolForm() {
    const {
        formAction,
        state,
        createPoolOnChain,
        isPending,
        isConfirming,
        showRetryDialog,
        handleRetry,
        handleRetryDialogClose,
        isDesktop,
        poolUpdated,
        hasAttemptedChainCreation,
    } = useCreatePool()

    const isRouting = use$(appStore$.settings.isRouting)
    const hasCreatedPool = useRef(false)

    const { setStep, showToast } = usePoolCreationStore(state => ({
        setStep: state.setStep,
        showToast: state.showToast,
    }))

    const { pending } = useFormStatus()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string[]>>(state.errors || {})

    const hasErrors = Object.values(formErrors).some(errorArray => errorArray.length > 0)
    const isProcessing = isSubmitting || pending || isPending || isConfirming

    const isButtonDisabled = hasErrors || isProcessing

    console.log('Form state:', { hasErrors, isProcessing, isButtonDisabled, pending, isPending, isConfirming })

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            console.log('handleSubmit called')
            if (isButtonDisabled) {
                console.log('Button is disabled, preventing submission')
                event.preventDefault()
                return
            }
            console.log('Proceeding with form submission')
            setIsSubmitting(true)
            setStep(Steps.CreatingDB)
            showToast({
                type: 'info',
                message: 'Creating pool in DB...',
            })
        },
        [isButtonDisabled, setStep, showToast],
    )

    useEffect(() => {
        console.log('Effect: Updating isSubmitting state', { pending, isPending, isConfirming })
        if (!pending && !isPending && !isConfirming) {
            setIsSubmitting(false)
        }
    }, [pending, isPending, isConfirming])

    useEffect(() => {
        console.log('Effect: Setting up bottom bar content')
        if (!isRouting) {
            appActions.setBottomBarContent(
                <Button
                    type='submit'
                    form='pool-form'
                    disabled={isButtonDisabled}
                    className='btn-cta mb-3 h-[46px] w-full rounded-[2rem] px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    {isProcessing ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                    {isProcessing
                        ? isPending
                            ? 'Creating in DB...'
                            : isConfirming
                              ? 'Confirming on-chain...'
                              : 'Processing...'
                        : hasErrors
                          ? 'Fix form errors'
                          : 'Create Pool'}
                </Button>,
            )
        }
        appActions.setTransactionInProgress(isPending || isConfirming)

        return () => {
            appActions.setBottomBarContent(null)
        }
    }, [isPending, isConfirming, isButtonDisabled, isProcessing, hasErrors, isRouting])

    useEffect(() => {
        console.log('Effect: Checking pool creation status', {
            message: state.message,
            internalPoolId: state.internalPoolId,
            poolUpdated,
            hasAttemptedChainCreation,
        })
        if (
            state.message === 'Pool created successfully' &&
            state.internalPoolId &&
            !hasCreatedPool.current &&
            !poolUpdated &&
            !hasAttemptedChainCreation
        ) {
            console.log('Pool created successfully, calling createPoolOnChain')
            hasCreatedPool.current = true
            createPoolOnChain()
        }
        if (state.message?.includes('Error')) {
            console.log('Pool creation failed:', state.message)
            setIsSubmitting(false)
            hasCreatedPool.current = false // Reset this here
        }
    }, [state.message, state.internalPoolId, createPoolOnChain, poolUpdated, hasAttemptedChainCreation])

    return (
        <>
            <form
                id='pool-form'
                action={formAction}
                onSubmit={handleSubmit}
                onChange={() => {
                    setFormErrors({})
                    setIsSubmitting(false)
                }}
                className='flex size-full flex-col gap-6 overflow-y-auto pb-[90px] pt-6'>
                {formFields.map(field => {
                    const errors = formErrors[field.key] || []

                    return (
                        <section key={field.key} className='flex flex-1 flex-col'>
                            <Label className='text-base font-medium text-[#090909]'>{field.label}</Label>
                            <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>
                            <field.component name={field.name} />
                            {errors.length > 0 && <p className='mt-1 text-xs text-red-500'>{errors.join(', ')}</p>}
                        </section>
                    )
                })}
                <Button type='submit' className='hidden'>
                    Submit
                </Button>
            </form>
            <RetryDialog
                open={showRetryDialog}
                onOpenChange={open => {
                    if (!open) void handleRetryDialogClose()
                }}
                onRetry={handleRetry}
                onCancel={() => void handleRetryDialogClose()}
                isDesktop={isDesktop}
            />
        </>
    )
}
