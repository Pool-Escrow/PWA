import { LogOutIcon, UndoIcon, UserIcon } from 'lucide-react'
import type { LinkProps } from 'next/link'

interface DropdownItemConfig {
    href?: LinkProps<unknown>['href']
    icon: JSX.Element
    label: string
    onClick?: () => Promise<void> | void
    showSeparator?: boolean
}

export const dropdownItemsConfig: DropdownItemConfig[] = [
    {
        href: '/profile',
        icon: <UserIcon />,
        label: 'Edit Profile',
    },
    {
        href: '/profile/request-refund',
        icon: <UndoIcon />,
        label: 'Request a refund',
    },
    {
        icon: <LogOutIcon />,
        label: 'Disconnect',
        showSeparator: false,
    },
]

export type { DropdownItemConfig }
