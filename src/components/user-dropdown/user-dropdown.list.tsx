/**
 * @file src/components/user-dropdown/user-dropdown.list.tsx
 * @description This file contains the `UserDropdownList` component that renders the list of items
 * for the user dropdown menu including options like 'Edit Profile', 'Request a refund', and 'Disconnect'.
 */

'use client'

import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import UserDropdownItem from './user-dropdown.item'
import type { DropdownItemConfig } from './user-dropdown.list.config'
import { dropdownItemsConfig } from './user-dropdown.list.config'
import { useRouter } from 'next/navigation'
import { Route } from 'next'
import OnRampDialog from '../common/dialogs/onramp.dialog'
import { dropletAddress } from '@/types/droplet'
import { wagmi } from '@/providers/configs'

/**
 * Variants for the dropdown menu animation using framer-motion.
 */
const menuVariants: Variants = {
    closed: {
        opacity: 0,
        transition: { when: 'afterChildren', staggerChildren: 0.1 },
    },
    open: {
        opacity: 1,
        transition: { when: 'beforeChildren', staggerChildren: 0.1 },
    },
}

const itemVariants: Variants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
}

/**
 * UserDropdownList component renders a list of dropdown items in the user menu.
 *
 * @component
 * @returns {JSX.Element} The rendered user dropdown list.
 */
const UserDropdownList: React.FC<{ setOpen: (open: boolean) => void }> = ({ setOpen }): JSX.Element => {
    const { disconnect } = useDisconnect()
    const { logout } = usePrivy()
    const router = useRouter()
    const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)
    const dropdownListRef = useRef<HTMLDivElement | null>(null)
    const [openOnRampDialog, setOpenOnRampDialog] = useState(false)

    const account = useAccount()
    const { data: tokenBalanceData } = useBalance({
        address: account.address,
        token: dropletAddress[wagmi.config.state.chainId as ChainId],
    })

    const decimals = BigInt(tokenBalanceData?.decimals ?? BigInt(18))
    const tokenBalance = ((tokenBalanceData?.value ?? BigInt(0)) / BigInt(10) ** decimals).toString()

    /**
     * Handles the click event on the 'Disconnect' dropdown item.
     */
    const handleLogoutClick = async () => {
        // close the dropdown menu:
        setOpen(false)

        // disconnect wagmi
        disconnect(
            {},
            {
                onError() {
                    toast.error('Failed to disconnect')
                },
            },
        )
        console.log('Disconnecting...')

        // disconnect privy:
        try {
            await logout().then(() => {
                console.log('Logged out')
                toast.success('Disconnected successfully')
                router.push('/' as Route)
            })
        } catch {
            toast.error('Failed to log out')
        }
    }

    const handleDepositClick = async () => {
        setOpenOnRampDialog(true)
    }
    /**
     * Handles mouse entering a dropdown item to set the hovered state.
     *
     * @param {number} index - Index of the hovered item
     */
    const handleMouseEnter = (index: number) => setHoveredItemIndex(index)

    /**
     * Resets the hovered item index on mouse leave.
     */
    const handleMouseLeave = () => setHoveredItemIndex(null)

    // Assign the handleLogoutClick to the corresponding dropdown item
    const updatedDropdownItemsConfig: DropdownItemConfig[] = dropdownItemsConfig.map(
        item => {
            switch (item.label) {
                case 'Disconnect':
                    return { ...item, onClick: handleLogoutClick }
                case 'Deposit':
                    return { ...item, onClick: handleDepositClick }
                default:
                    return item
            }
        },

        // item.label === 'Disconnect' ? { ...item, onClick: handleLogoutClick } : item,
    )

    return (
        <motion.div
            initial='closed'
            animate='open'
            exit='closed'
            variants={menuVariants}
            className='pointer-events-none relative w-[213px] cursor-pointer'
            ref={dropdownListRef}
            style={{ pointerEvents: 'none' }}>
            {updatedDropdownItemsConfig.map((item, index) => (
                <motion.div
                    key={index}
                    className='relative px-3'
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    variants={itemVariants}
                    style={{ pointerEvents: 'auto' }}>
                    {hoveredItemIndex === index && (
                        <motion.div
                            layoutId='active-dropdown-item'
                            className='absolute inset-0 z-0 h-full rounded-lg bg-neutral-100 mix-blend-multiply'
                            transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 60,
                                mass: 0.3,
                                duration: 0.2,
                                bounce: 0.2,
                            }}
                            style={{ pointerEvents: 'none' }}
                        />
                    )}
                    <UserDropdownItem {...item} />
                </motion.div>
            ))}
            <OnRampDialog
                open={openOnRampDialog}
                setOpen={setOpenOnRampDialog}
                balance={tokenBalanceData?.value}
                decimalPlaces={decimals}
            />
        </motion.div>
    )
}

export default UserDropdownList
