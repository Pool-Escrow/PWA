'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/providers/app-store.provider'
import { Steps, usePoolCreationStore } from '@/stores/pool-creation-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { Resolver } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import type { z } from 'zod'
import RetryDialog from './_components/retry-dialog'
import { CreatePoolFormSchema, REQUIRED_FIELDS } from './_lib/definitions'
import { formFields } from './form-fields'
import { useCreatePool } from './use-create-pool'

export default function CreatePoolForm() {
    const {
        formAction,
        state,
        isPending,
        isConfirming,
        showRetryDialog,
        handleRetry,
        handleRetryDialogClose,
        isDesktop,
        formData,
        formErrors,
        handleFieldChange,
        validateForm,
    } = useCreatePool()

    type FormSchema = z.infer<typeof CreatePoolFormSchema>

    const methods = useForm<Partial<FormSchema>>({
        resolver: zodResolver(CreatePoolFormSchema) as unknown as Resolver<Partial<FormSchema>>,
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: formData,
    })

    const { setBottomBarContent, setTransactionInProgress } = useAppStore(s => ({
        setBottomBarContent: s.setBottomBarContent,
        setTransactionInProgress: s.setTransactionInProgress,
    }))

    const { setStep, showToast } = usePoolCreationStore(state => ({
        setStep: state.setStep,
        showToast: state.showToast,
    }))

    const { pending } = useFormStatus()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const errorCount = Object.values(formErrors).reduce((total, arr) => total + (arr?.length ?? 0), 0)
    const hasErrors = errorCount > 0

    // Refs to each field section for smooth scrolling
    const fieldRefs = useRef<Record<string, HTMLElement | null>>({})

    const isProcessing = isSubmitting || pending || isPending || isConfirming

    const isButtonDisabled = hasErrors || isProcessing

    // Stable handler for dateRange changes to avoid re-creating on each render
    const handleDateRangeChange = useCallback(
        (value: { start: Date; end: Date }) => handleFieldChange('dateRange', value as never),
        [handleFieldChange],
    )

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            console.log('Form submitted')

            if (!validateForm()) {
                console.log('Form validation failed, scrolling to first error')
                // Find the first field with an error and scroll to it
                const firstErrorField = Object.keys(formErrors).find(
                    key => (formErrors as Record<string, string[]>)[key]?.length > 0,
                )
                if (firstErrorField && fieldRefs.current[firstErrorField]) {
                    fieldRefs.current[firstErrorField]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })
                }
                return
            }

            setIsSubmitting(true)
            const formDataObj = new FormData(e.currentTarget)
            formAction(formDataObj)
        },
        [validateForm, formErrors, formAction],
    )

    useEffect(() => {
        console.log('Form state changed:', state)
        if (state?.message === 'Pool created successfully') {
            console.log('Pool created successfully')
            setStep(Steps.CreatingChain)
            setIsSubmitting(false)
        } else if (state?.message && state.message !== 'Pool created successfully') {
            console.log('Form submission failed:', state.message)
            setIsSubmitting(false)
            showToast({ type: 'error', message: state.message })
        }
    }, [state, setStep, showToast])

    useEffect(() => {
        if (isProcessing) {
            setTransactionInProgress(true)
        } else {
            setTransactionInProgress(false)
        }
    }, [isProcessing, setTransactionInProgress])

    useEffect(() => {
        if (isDesktop) return

        setBottomBarContent(
            <Button
                form='pool-form'
                type='submit'
                disabled={isButtonDisabled}
                className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:bg-cta-active active:shadow-button-push'>
                {isProcessing && <Loader2 className='mr-2 size-4 animate-spin' />}
                {isSubmitting ? 'Creating Pool...' : 'Create Pool'}
            </Button>,
        )

        return () => setBottomBarContent(null)
    }, [isDesktop, setBottomBarContent, isButtonDisabled, isProcessing, isSubmitting])

    return (
        <FormProvider {...methods}>
            <form
                id='pool-form'
                action={formAction}
                onSubmit={handleSubmit}
                className='flex size-full flex-col gap-6 overflow-y-auto pb-[90px] pt-6'>
                {formFields.map(field => {
                    const errors = formErrors?.[field.key] || []
                    const hasValueProp = field.key !== 'dateRange' // DateTimeRange component manages its own state

                    return (
                        <section
                            key={field.key}
                            ref={el => {
                                fieldRefs.current[field.key] = el
                            }}
                            className='flex flex-1 flex-col'>
                            <Label className='text-base font-medium text-[#090909]'>
                                {field.label}
                                {REQUIRED_FIELDS.has(field.key as never) && (
                                    <span className='ml-0.5 text-red-500'>*</span>
                                )}
                            </Label>
                            <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>

                            {/* Dynamically render the appropriate field component */}
                            {(() => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                                const FieldComponent = field.component as any
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                                const fieldName = (field as any).name as string

                                if (field.key === 'dateRange') {
                                    return (
                                        <FieldComponent
                                            name={fieldName}
                                            errors={errors}
                                            onChange={handleDateRangeChange}
                                        />
                                    )
                                }

                                if (hasValueProp) {
                                    return (
                                        <FieldComponent
                                            name={fieldName}
                                            value={formData?.[field.key] as never}
                                            onChange={(value: unknown) => handleFieldChange(field.key, value as never)}
                                            errors={errors}
                                        />
                                    )
                                }

                                return <FieldComponent name={fieldName} errors={errors} />
                            })()}
                            {/* Show general errors if not handled by component */}
                            {!hasValueProp && errors.length > 0 && field.key === 'dateRange' && (
                                <p className='mt-1 text-xs text-red-500' role='alert'>
                                    {errors.join(', ')}
                                </p>
                            )}
                        </section>
                    )
                })}

                {isDesktop && (
                    <div className='mt-8 flex justify-center'>
                        <Button
                            type='submit'
                            disabled={isButtonDisabled}
                            className='mb-3 h-[46px] w-full max-w-md rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:bg-cta-active active:shadow-button-push'>
                            {isProcessing && <Loader2 className='mr-2 size-4 animate-spin' />}
                            {isSubmitting ? 'Creating Pool...' : 'Create Pool'}
                        </Button>
                    </div>
                )}
            </form>

            <RetryDialog
                open={showRetryDialog}
                onOpenChange={open => {
                    if (!open) void handleRetryDialogClose()
                }}
                onRetry={handleRetry}
                onCancel={handleRetryDialogClose}
                isDesktop={isDesktop}
            />
        </FormProvider>
    )
}
