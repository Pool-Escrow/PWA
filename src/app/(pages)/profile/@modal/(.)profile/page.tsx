'use client'

import useMediaQuery from '@/app/_client/hooks/use-media-query'
import Balance from '@/app/_components/balance/balance'
import { Dialog } from '@/app/_components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/app/_components/ui/drawer'
import UserDropdown from '@/components/user-dropdown'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import UserInfo from '../../_components/user-info/user-info'
import { ClaimablePrizes } from '../../claim-winning/_components'

export default function ProfileModal() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const isDesktop = useMediaQuery('(min-width: 768px)')

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpen(true)
        })
    }, [])

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setTimeout(() => {
                router.back()
            }, 100)
        }
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <Dialog.Content>
                    <Dialog.Header>
                        <div className='flex items-center justify-between'>
                            <Dialog.Title>User Profile</Dialog.Title>
                            <UserDropdown />
                        </div>
                    </Dialog.Header>
                    <div className='space-y-[0.94rem] bg-white p-2'>
                        <UserInfo />
                        <Balance color='#5472E9' />
                        <ClaimablePrizes />
                    </div>
                </Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerContent className='h-[85vh]'>
                <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
                <DrawerHeader>
                    <div className='flex items-center justify-between'>
                        <DrawerTitle>User Profile</DrawerTitle>
                        <UserDropdown />
                    </div>
                </DrawerHeader>
                <div className='space-y-[0.94rem] overflow-y-auto bg-white p-2'>
                    <UserInfo />
                    <Balance color='#5472E9' />
                    <ClaimablePrizes />
                </div>
            </DrawerContent>
        </Drawer>
    )
}
