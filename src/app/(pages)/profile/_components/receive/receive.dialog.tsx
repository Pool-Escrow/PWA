'use client'

import { Button } from '@/app/_components/ui/button'
import { Dialog } from '@/app/_components/ui/dialog'
import { useState } from 'react'
import ReceiveForm from './receive.form'

const ReceiveDialog = () => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button
                    type='button'
                    title='Share with Friends'
                    className='btn-cta h-10 w-20 rounded-[2rem] text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    Receive
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className='bg-white sm:max-w-[425px]'>
                <Dialog.Header>
                    <Dialog.Title>Receive</Dialog.Title>
                    <Dialog.Description>Scan the QR code or copy the address to send funds.</Dialog.Description>
                </Dialog.Header>
                <ReceiveForm />
            </Dialog.Content>
        </Dialog>
    )
}

export default ReceiveDialog
