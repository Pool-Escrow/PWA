'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu'
import { EllipsisIcon } from 'lucide-react'
import { useState } from 'react'
import UserDropdownList from './user-dropdown.list'

const UserDropdown: React.FC = (): JSX.Element => {
    const [open, setOpen] = useState(false)
    const container = document.querySelector('main')

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className='cursor-pointer rounded-full p-2 hover:bg-gray-200 focus:outline-none active:scale-90 active:bg-gray-300 text-black'>
                <EllipsisIcon size={24} />
            </DropdownMenuTrigger>
            {open && <div className='dropdown-backdrop' />}
            <DropdownMenuPortal container={container}>
                <DropdownMenuContent align='end'>
                    <UserDropdownList setOpen={setOpen} />
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    )
}

export default UserDropdown
