'use client'

import { Button } from '@/app/_components/ui/button'
import { Drawer } from '@/app/_components/ui/drawer'
import { useEffect, useState } from 'react'

// Definir la interfaz para el evento BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPromptDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsOpen(true)
        }

        // Usar una verificación más moderna para iOS
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !('standalone' in navigator))
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

        // Trigger for desktop browsers that don't support beforeinstallprompt
        if (!isStandalone && !isIOS && !deferredPrompt) {
            setIsOpen(true)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
        }
    }, [isStandalone, isIOS, deferredPrompt])

    const handleInstall = async () => {
        try {
            if (deferredPrompt) {
                await deferredPrompt.prompt()
                const choiceResult = await deferredPrompt.userChoice
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt')
                }
                setDeferredPrompt(null)
            }
            setIsOpen(false)
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error handling install prompt:', error.message)
            } else {
                console.error('Error handling install prompt: Unknown error')
            }
            setIsOpen(false)
        }
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
                            onClick={() => void handleInstall()}
                            className='btn-cta w-full rounded-[2rem] text-center font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                            Add to Home Screen
                        </Button>
                    )}
                </div>
            </Drawer.Content>
        </Drawer>
    )
}
