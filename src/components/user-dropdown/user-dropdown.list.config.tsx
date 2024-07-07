import { LogOutIcon, UndoIcon, UserIcon, SendIcon, PlusIcon } from 'lucide-react'
import { Route } from 'next'
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
        href: '/profile/edit' as Route,
        icon: <UserIcon />,
        label: 'Edit Profile',
    },
    {
        icon: <PlusIcon />,
        label: 'Deposit',
    },
    {
        href: '/send' as Route,
        icon: <SendIcon />,
        label: 'Send',
    },
    {
        href: '/profile/request-refund' as Route,
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
