/**
 * @file src/components/user-dropdown/user-dropdown.item.tsx
 * @description This file contains the `UserDropdownItem` component that renders an item for the user dropdown menu.
 */

import { DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Props for UserDropdownItem component.
 */
interface RegisteredDropdownItemProps {
    /**
     * The URL or path to navigate to when the menu item is clicked.
     */
    href?: LinkProps<unknown>['href']
    /**
     * The icon to display in the menu item.
     */
    icon: ReactNode
    /**
     * The text label to display in the menu item.
     */
    label: string
    /**
     * Optional click handler if the menu item is not a link.
     */
    onClick?: () => void
    /**
     * Determines if the separator should be shown after the menu item.
     * Defaults to true.
     */
    showSeparator?: boolean
}

/**
 * UserDropdownItem component for user dropdowns.
 * @param {RegisteredDropdownItemProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered menu item.
 */
export default function RegisteredDropdownItem({
    href,
    icon,
    label,
    onClick,
    showSeparator = true,
}: RegisteredDropdownItemProps): JSX.Element {
    const menuItem = (
        <DropdownMenuLabel
            onClick={onClick}
            className='pointer-events-auto z-10 flex items-center gap-[6px] text-xs font-normal leading-tight text-black'>
            {icon}
            <span>{label}</span>
        </DropdownMenuLabel>
    )

    return (
        <>
            {href ? (
                <Link href={href} passHref legacyBehavior>
                    {menuItem}
                </Link>
            ) : (
                <div>{menuItem}</div>
            )}
            {showSeparator && <DropdownMenuSeparator />}
        </>
    );
}
