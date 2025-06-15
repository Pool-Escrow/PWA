import useMediaQuery from '@/app/_client/hooks/use-media-query'
import { Button } from '@/app/_components/ui/button'
import { Dialog } from '@/app/_components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/app/_components/ui/drawer'
import { useConfetti } from '@/hooks/use-confetti'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { CheckCircle, PartyPopper } from 'lucide-react'
import { useEffect } from 'react'

interface JoinPoolFeedbackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    poolName?: string
}

const FeedbackContent = ({ poolName, onClose }: { poolName?: string; onClose: () => void }) => {
    return (
        <div className='flex flex-col items-center space-y-6 p-6 text-center'>
            <div className='flex items-center justify-center space-x-2'>
                <CheckCircle className='size-8 text-green-500' />
                <PartyPopper className='size-8 text-yellow-500' />
            </div>

            <div className='space-y-2'>
                <h2 className='text-2xl font-bold text-green-600'>🎉 Welcome to the Pool!</h2>
                <p className='text-lg text-gray-700'>
                    You&apos;ve successfully joined{poolName ? ` "${poolName}"` : ' the pool'}!
                </p>
            </div>

            <div className='space-y-3 text-sm text-gray-600'>
                <p className='flex items-center justify-center space-x-2'>
                    <span>✅</span>
                    <span>Your registration is confirmed</span>
                </p>
                <p className='flex items-center justify-center space-x-2'>
                    <span>🎫</span>
                    <span>Your ticket is ready to view</span>
                </p>
                <p className='flex items-center justify-center space-x-2'>
                    <span>🔔</span>
                    <span>You&apos;ll be notified of any updates</span>
                </p>
            </div>

            <Button
                onClick={onClose}
                className='w-full rounded-full bg-green-600 px-8 py-3 text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'>
                Awesome! Let&apos;s Go
            </Button>
        </div>
    )
}

export default function JoinPoolFeedbackDialog({ open, onOpenChange, poolName }: JoinPoolFeedbackDialogProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const { startConfetti, ConfettiComponent } = useConfetti()

    // Start confetti when dialog opens
    useEffect(() => {
        if (open) {
            // Small delay to ensure dialog is fully rendered before starting confetti
            const timer = setTimeout(() => {
                startConfetti()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [open, startConfetti])

    const handleClose = () => {
        onOpenChange(false)
    }

    const sharedProps = {
        open,
        onOpenChange,
    }

    if (isDesktop) {
        return (
            <>
                <ConfettiComponent />
                <Dialog {...sharedProps}>
                    <Dialog.Content className='bg-white sm:max-w-md'>
                        <VisuallyHidden.Root>
                            <DialogTitle>Pool Registration Success</DialogTitle>
                            <DialogDescription>
                                Congratulations! You have successfully joined the pool.
                            </DialogDescription>
                        </VisuallyHidden.Root>
                        <FeedbackContent poolName={poolName} onClose={handleClose} />
                    </Dialog.Content>
                </Dialog>
            </>
        )
    }

    return (
        <>
            <ConfettiComponent />
            <Drawer {...sharedProps}>
                <DrawerContent className='bg-white'>
                    <VisuallyHidden.Root>
                        <DrawerTitle>Pool Registration Success</DrawerTitle>
                        <DrawerDescription>Congratulations! You have successfully joined the pool.</DrawerDescription>
                    </VisuallyHidden.Root>
                    <DrawerHeader className='sr-only'>
                        <DrawerTitle>Pool Registration Success</DrawerTitle>
                        <DrawerDescription>Congratulations! You have successfully joined the pool.</DrawerDescription>
                    </DrawerHeader>
                    <FeedbackContent poolName={poolName} onClose={handleClose} />
                    <DrawerFooter className='pt-2'>
                        {/* Footer content is handled by the FeedbackContent component */}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}
