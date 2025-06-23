'use client'
/**
 * @file src/components/user-dropdown/user-dropdown.tsx
 * @description This file contains the `UserDropdown` component that renders the entire user dropdown menu,
 * including the avatar trigger and the list of dropdown items.
 */

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from 'react'
import RegisteredDropdownList from './registered-dropdown.list'

/**
 * UserDropdown component that renders the full dropdown menu for the user.
 *
 * @component
 * @returns {JSX.Element} The rendered user dropdown menu.
 */
const RegisteredDropdown: React.FC<{ poolId: string }> = ({ poolId }): JSX.Element => {
    const [open, setOpen] = useState(false)
    const [container, setContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
        // Asume que el contenedor main tiene la referencia global mainRef
        setContainer(document.querySelector('main'))
    }, [])

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger>{/* <RegisteredDropdownButton /> */}</DropdownMenuTrigger>
            {open && <div className='dropdown-backdrop' />}
            <DropdownMenuPortal container={container}>
                <DropdownMenuContent align='end'>
                    <RegisteredDropdownList setOpen={setOpen} poolId={poolId} />
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    )
}

export default RegisteredDropdown
