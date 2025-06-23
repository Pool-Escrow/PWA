'use client'

import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPromptDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsOpen(true)
        }

        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window))
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Trigger for desktop browsers that don't support beforeinstallprompt
        if (!isStandalone && !isIOS && !deferredPrompt) {
            setIsOpen(true)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [isStandalone, isIOS, deferredPrompt])

    const handleInstall = () => {
        if (deferredPrompt) {
            void deferredPrompt.prompt()
            void deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt')
                }
                setDeferredPrompt(null)
            })
        }
        setIsOpen(false)
    }

    if (isStandalone) return null

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <Drawer.Content className='bg-white'>
                <Drawer.Header className='text-left'>
                    <Drawer.Title className='mb-6 text-xl'>Install Pool App</Drawer.Title>
                    <Drawer.Description>Install our app for a better experience and quick access.</Drawer.Description>
                </Drawer.Header>
                <div className='p-4'>
                    {isIOS ? (
                        <p>
                            To install this app on your iOS device, tap the share button
                            <span role='img' aria-label='share icon'>
                                {' '}
                                ⎋{' '}
                            </span>
                            and then &quot;Add to Home Screen&quot;
                            <span role='img' aria-label='plus icon'>
                                {' '}
                                ➕{' '}
                            </span>
                            .
                        </p>
                    ) : (
                        <Button
                            onClick={handleInstall}
                            className='w-full rounded-[2rem] bg-cta text-center font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                            Add to Home Screen
                        </Button>
                    )}
                </div>
            </Drawer.Content>
        </Drawer>
    )
}
