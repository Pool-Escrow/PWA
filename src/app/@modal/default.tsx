'use client'

import InstallPrompt from '@/components/install-prompt'
import { Dialog } from '@/components/ui/dialog'
import { Drawer } from '@/components/ui/drawer'
import useMediaQuery from '@/hooks/use-media-query'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DefaultModal() {
    const [open, setOpen] = useState(false)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const pathname = usePathname()

    useEffect(() => {
        // Check if the app is installable
        const isInstallable = !window.matchMedia('(display-mode: standalone)').matches
        setShowInstallPrompt(isInstallable)

        // Open the modal when the component mounts
        setOpen(true)
    }, [])

    // Determine if we should show the modal based on the current route
    const shouldShowModal = pathname === '/some-specific-route'

    if (!shouldShowModal) return null

    const ModalComponent = isDesktop ? Dialog : Drawer
    const modalProps = isDesktop
        ? {
              open,
              onOpenChange: setOpen,
          }
        : {
              open,
              onOpenChange: setOpen,
              onClose: () => setOpen(false),
          }

    return (
        <ModalComponent {...modalProps}>
            <ModalComponent.Content>
                <ModalComponent.Header>
                    <ModalComponent.Title>Welcome</ModalComponent.Title>
                    <ModalComponent.Description>
                        This is a modal that appears on specific routes.
                    </ModalComponent.Description>
                </ModalComponent.Header>
                {showInstallPrompt && <InstallPrompt />}
                {/* Add any additional content here */}
            </ModalComponent.Content>
        </ModalComponent>
    )
}
