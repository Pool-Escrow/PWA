import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'

interface RetryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onRetry: () => void
    onCancel: () => Promise<void>
    isDesktop: boolean
}

const RetryDialog = ({ open, onOpenChange, onRetry, onCancel, isDesktop }: RetryDialogProps) => {
    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <Dialog.Content className='bg-white sm:max-w-[425px]'>
                    <Dialog.Header>
                        <Dialog.Title>Transaction Failed</Dialog.Title>
                        <Dialog.Description>
                            The transaction was not completed. Would you like to try again or cancel the pool creation?
                        </Dialog.Description>
                    </Dialog.Header>
                    <div className='mt-4 flex justify-end space-x-2'>
                        <Button variant='outline' onClick={() => void onCancel()}>
                            Cancel Creation
                        </Button>
                        <Button onClick={onRetry}>Retry Transaction</Button>
                    </div>
                </Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className='bg-white'>
                <DrawerHeader className='text-left'>
                    <DrawerTitle>Transaction Failed</DrawerTitle>
                    <DrawerDescription>
                        The transaction was not completed. Would you like to try again or cancel the pool creation?
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className='pt-2'>
                    <Button onClick={onRetry}>Retry Transaction</Button>
                    <DrawerClose asChild>
                        <Button variant='outline' onClick={() => void onCancel()}>
                            Cancel Creation
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default RetryDialog
