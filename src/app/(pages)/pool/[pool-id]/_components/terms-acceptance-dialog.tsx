'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Label } from '@/app/_components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/app/_components/ui/button'
import { cn } from '@/lib/utils/tailwind'
import { Drawer, DrawerDescription, DrawerTitle } from '@/app/_components/ui/drawer'
import { Dialog } from '@/app/_components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'

type CheckboxState = {
    terms: boolean
    code: boolean
}

const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)
        const updateMatch = () => setMatches(media.matches)
        updateMatch()
        media.addEventListener('change', updateMatch)
        return () => media.removeEventListener('change', updateMatch)
    }, [query])

    return matches
}

type ContentProps = {
    checkboxes: CheckboxState
    handleCheckboxChange: (id: keyof CheckboxState) => void
    handleSubmit: () => Promise<void>
    isButtonEnabled: boolean
}

const Content = ({ checkboxes, handleCheckboxChange, handleSubmit, isButtonEnabled }: ContentProps) => (
    <div className='space-y-4 p-4'>
        <h2 className='text-lg font-semibold' id='registration-title'>
            Registration
        </h2>
        <form
            onSubmit={e => {
                e.preventDefault()
                handleSubmit()
            }}
            className='space-y-4'>
            {(Object.keys(checkboxes) as Array<keyof CheckboxState>).map(key => (
                <div key={key} className='flex items-center space-x-2'>
                    <Checkbox
                        id={key}
                        checked={checkboxes[key]}
                        onCheckedChange={() => handleCheckboxChange(key)}
                        aria-describedby={`${key}-label`}
                    />
                    <Label htmlFor={key} id={`${key}-label`} className='text-sm'>
                        I accept the{' '}
                        <Link
                            href={key === 'terms' ? '/terms-and-conditions' : '/code-of-conduct'}
                            className='text-primary hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'>
                            {key === 'terms' ? 'Terms and Conditions' : 'Code of Conduct'}
                        </Link>
                    </Label>
                </div>
            ))}
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
                {!isButtonEnabled &&
                    ' You must accept both the Terms and Conditions and the Code of Conduct to register.'}
            </p>
        </form>
    </div>
)

interface HybridRegistrationProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAccept: () => void
}

export default function HybridRegistration({ open, onOpenChange, onAccept }: HybridRegistrationProps) {
    const [checkboxes, setCheckboxes] = useState<CheckboxState>({
        terms: false,
        code: false,
    })
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const handleCheckboxChange = useCallback((id: keyof CheckboxState) => {
        setCheckboxes(prev => ({ ...prev, [id]: !prev[id] }))
    }, [])

    const isButtonEnabled = Object.values(checkboxes).every(Boolean)

    const handleSubmit = useCallback(async () => {
        if (!isButtonEnabled) return

        try {
            // Simulating an API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('Terms accepted')
            onAccept()
            onOpenChange(false)
            // Reset checkboxes after successful submission
            setCheckboxes({ terms: false, code: false })
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
        />
    )

    useEffect(() => {
        // Close the dialog/drawer when switching between desktop and mobile
        onOpenChange(false)
    }, [isDesktop])

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