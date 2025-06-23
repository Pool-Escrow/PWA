import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog } from '@/components/ui/dialog'
import { Drawer, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import useMediaQuery from '@/hooks/use-media-query'
import { cn } from '@/lib/utils/tailwind'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type CheckboxState = {
    terms: boolean
}

type ContentProps = {
    checkboxes: CheckboxState
    handleCheckboxChange: (id: keyof CheckboxState) => void
    handleSubmit: () => Promise<void>
    isButtonEnabled: boolean
    termsUrl: string
}

const Content = ({ checkboxes, handleCheckboxChange, handleSubmit, isButtonEnabled, termsUrl }: ContentProps) => (
    <div className='space-y-4 p-4'>
        <h2 className='text-lg font-semibold' id='registration-title'>
            Registration
        </h2>
        <form
            onSubmit={e => {
                e.preventDefault()
                void handleSubmit()
            }}
            className='space-y-4'>
            <div className='flex items-center space-x-2'>
                <Checkbox
                    id='terms'
                    checked={checkboxes.terms}
                    onCheckedChange={() => handleCheckboxChange('terms')}
                    aria-describedby='terms-label'
                />
                <Label htmlFor='terms' id='terms-label' className='text-sm'>
                    I accept the{' '}
                    <Link
                        href={termsUrl}
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='external noopener noreferrer nofollow'>
                        Terms and Conditions
                    </Link>
                </Label>
            </div>
            <Button
                type='submit'
                className={cn(
                    'w-full rounded-full transition-colors duration-200',
                    isButtonEnabled
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'cursor-not-allowed bg-muted text-muted-foreground',
                )}
                disabled={!isButtonEnabled}
                aria-describedby='submit-description'>
                Accept and register
            </Button>
            <p id='submit-description' className='sr-only'>
                This button is {isButtonEnabled ? 'enabled' : 'disabled'}.
                {!isButtonEnabled && ' You must accept the Terms and Conditions to register.'}
            </p>
        </form>
    </div>
)

interface HybridRegistrationProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAccept: () => void
    termsUrl: string
}

export default function HybridRegistration({ open, onOpenChange, onAccept, termsUrl }: HybridRegistrationProps) {
    const [checkboxes, setCheckboxes] = useState<CheckboxState>({
        terms: false,
    })
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const handleCheckboxChange = useCallback((id: keyof CheckboxState) => {
        setCheckboxes(prev => ({ ...prev, [id]: !prev[id] }))
    }, [])

    const isButtonEnabled = checkboxes.terms

    const handleSubmit = useCallback(async () => {
        if (!isButtonEnabled) return

        try {
            // Simulating an API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('Terms accepted')
            onAccept()
            onOpenChange(false)
            // Reset checkbox after successful submission
            setCheckboxes({ terms: false })
        } catch (error) {
            console.error('Terms acceptance failed:', error)
            // Handle error (e.g., show an error message to the user)
        }
    }, [isButtonEnabled, onAccept, onOpenChange])

    // Shared props for Dialog and Drawer
    const sharedProps = {
        open,
        onOpenChange,
    }

    // Shared content
    const sharedContent = (
        <Content
            checkboxes={checkboxes}
            handleCheckboxChange={handleCheckboxChange}
            handleSubmit={handleSubmit}
            isButtonEnabled={isButtonEnabled}
            termsUrl={termsUrl}
        />
    )

    useEffect(() => {
        // Close the dialog/drawer when switching between desktop and mobile
        onOpenChange(false)
    }, [isDesktop, onOpenChange])

    if (isDesktop) {
        return (
            <Dialog {...sharedProps}>
                {/* <Dialog.Trigger asChild>
                    <Button variant='outline'>Open Registration</Button>
                </Dialog.Trigger> */}
                <Dialog.Content>
                    <VisuallyHidden.Root>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                        <DialogDescription>Accept the terms and conditions to register</DialogDescription>
                    </VisuallyHidden.Root>
                    {sharedContent}
                </Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer {...sharedProps}>
            {/* <Drawer.Trigger asChild>
                <Button variant='outline'>Open Registration</Button>
            </Drawer.Trigger> */}
            <Drawer.Content>
                <VisuallyHidden.Root>
                    <DrawerTitle>Terms and Conditions</DrawerTitle>
                    <DrawerDescription>Accept the terms and conditions to register</DrawerDescription>
                </VisuallyHidden.Root>
                {sharedContent}
            </Drawer.Content>
        </Drawer>
    )
}
