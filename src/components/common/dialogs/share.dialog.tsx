'use client'

import shareIcon from '@/../public/images/share_icon.svg'
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
    DrawerTrigger,
} from '@/components/ui/drawer'
import useMediaQuery from '@/hooks/use-media-query'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { useState } from 'react'
import ShareForm from './share.form'

const ShareDialog = () => {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <button
                        type='button'
                        title='Share with Friends'
                        className='flex size-8 items-center justify-center rounded-full bg-black/40 p-2 md:size-10 md:p-3'>
                        <Image className='flex h-6 w-6' src={shareIcon as StaticImport} alt='Share with Friends' />
                    </button>
                </Dialog.Trigger>
                <Dialog.Content className='bg-white sm:max-w-[425px]'>
                    <Dialog.Header>
                        <Dialog.Title>Share with Friends</Dialog.Title>
                        <Dialog.Description>
                            Invites are best attended with friends. The more the merrier.
                        </Dialog.Description>
                    </Dialog.Header>
                    <ShareForm />
                </Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <button
                    title='Share with Friends'
                    type='button'
                    className='size-8 rounded-full bg-black/40 p-2 md:size-10 md:p-3'>
                    <Image className='flex size-full' src={shareIcon as StaticImport} alt='Share with Friends' />
                </button>
            </DrawerTrigger>
            <DrawerContent className='bg-white'>
                <DrawerHeader className='text-left'>
                    <DrawerTitle>Share with Friends</DrawerTitle>
                    <DrawerDescription>Invites are best attended with friends. The more the merrier.</DrawerDescription>
                </DrawerHeader>
                <ShareForm className='px-4' />
                <DrawerFooter className='pt-2'>
                    <DrawerClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default ShareDialog
