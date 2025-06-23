import { AlertDialog } from '@/components/ui/alert-dialog'
import type { Dispatch, SetStateAction } from 'react'
import LoadingAnimation from './loading-animation'

interface TransactionDialogProps {
    open: boolean
    title?: string | undefined
    message?: string | undefined
    showLoadAnimation?: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

const TransactionDialog = ({ open, title, message, showLoadAnimation, setOpen }: TransactionDialogProps) => {
    return (
        <AlertDialog open={open}>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>{title ?? 'Transaction in Progress'}</AlertDialog.Title>
                    {showLoadAnimation && <LoadingAnimation />}
                    <AlertDialog.Description>
                        {message ?? 'Kindly sign the requested transaction/s to proceed.'}
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Action onClick={() => setOpen(false)}>Okay</AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog>
    )
}

export default TransactionDialog
