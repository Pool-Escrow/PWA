'use client'

import { useState, useEffect } from 'react'
import { Drawer } from '@/app/_components/ui/drawer'
import { Button } from '@/app/_components/ui/button'

export default function InstallPromptDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsOpen(true)
        }

        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
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
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
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
                            and then "Add to Home Screen"
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
