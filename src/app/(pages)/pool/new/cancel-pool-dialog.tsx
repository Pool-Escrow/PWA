import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@/app/_components/ui/dialog'
import { Drawer } from '@/app/_components/ui/drawer'
import { Button } from '@/app/_components/ui/button'
import useMediaQuery from '@/app/_client/hooks/use-media-query'
import { deletePool } from './actions'
import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'

interface CancelPoolDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    internalPoolId: string
    onRetry: () => void
}

export function CancelPoolDialog({ open, onOpenChange, internalPoolId, onRetry }: CancelPoolDialogProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const { showToast } = usePoolCreationStore()

    const handleCancel = async () => {
        setIsDeleting(true)
        try {
            await deletePool(internalPoolId)
            showToast({
                type: 'success',
                message: 'Pool creation cancelled successfully.',
            })
            router.push('/pools')
        } catch (error) {
            console.error('Error cancelling pool:', error)
            showToast({
                type: 'error',
                message: 'Failed to cancel pool creation. Please try again.',
            })
        } finally {
            setIsDeleting(false)
            onOpenChange(false)
        }
    }

    const content = (
        <>
            <h2 className='text-lg font-semibold'>Cancel Pool Creation</h2>
            <p className='mt-2'>
                Are you sure you want to cancel the creation of this pool? This action cannot be undone.
            </p>
            <div className='mt-4 flex justify-end space-x-2'>
                <Button variant='outline' onClick={() => onOpenChange(false)}>
                    Close
                </Button>
                <Button onClick={onRetry}>Retry</Button>
                <Button variant='destructive' onClick={handleCancel} disabled={isDeleting}>
                    {isDeleting ? 'Cancelling...' : 'Cancel Pool'}
                </Button>
            </div>
        </>
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <Dialog.Content>{content}</Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <Drawer.Content>
                <div className='p-4'>{content}</div>
            </Drawer.Content>
        </Drawer>
    )
}
