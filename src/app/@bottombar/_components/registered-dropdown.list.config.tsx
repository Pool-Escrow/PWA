import { User2Icon } from 'lucide-react'
import type { LinkProps } from 'next/link'
import React from 'react'

interface RegisteredDropdownItemConfig {
    href?: LinkProps<unknown>['href']
    icon: React.JSX.Element
    label: string
    onClick?: () => Promise<void> | void
    showSeparator?: boolean
}

export const dropdownItemsConfig: RegisteredDropdownItemConfig[] = [
    {
        icon: <User2Icon />,
        label: 'Unregister from Pool',
        showSeparator: false,
    },
]

export type { RegisteredDropdownItemConfig }
