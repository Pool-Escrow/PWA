import { ArrowLeftRight, LogOutIcon, PlusIcon, SendIcon, UndoIcon, UserIcon } from 'lucide-react'
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
        icon: <UserIcon />,
        label: 'Edit Profile',
        href: '/profile/edit',
    },
    {
        icon: <PlusIcon />,
        label: 'Deposit',
    },
    {
        label: 'Cross-swap',
        icon: <ArrowLeftRight />,
        href: '/profile/cross-swap',
    },
    {
        icon: <SendIcon />,
        label: 'Send',
        href: '/profile/send',
    },
    {
        icon: <UndoIcon />,
        label: 'Request a refund',
        href: '/profile/request-refund',
    },
    {
        icon: <LogOutIcon />,
        label: 'Disconnect',
    },
]

export type { DropdownItemConfig }
