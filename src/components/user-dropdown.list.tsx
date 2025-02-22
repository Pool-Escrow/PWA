'use client'

import { useAuth } from '@/app/_client/hooks/use-auth'
import { useOnRamp } from '@/app/_client/hooks/use-onramp'
import type { Variants } from 'motion/react'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import UserDropdownItem from './user-dropdown.item'
import type { DropdownItemConfig } from './user-dropdown.list.config'
import { dropdownItemsConfig } from './user-dropdown.list.config'

/**
 * Variants for the dropdown menu animation using motion/react.
 */
const menuVariants: Variants = {
    closed: {
        opacity: 0.3,
        transition: {
            when: 'afterChildren',
            staggerChildren: 0.06,
            duration: 0.1,
            type: 'spring',
            bounce: 0.2,
        },
    },
    open: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.06,
            duration: 0.1,
            type: 'spring',
            bounce: 0.2,
        },
    },
}

const itemVariants: Variants = {
    closed: { opacity: 0, y: -40 },
    open: { opacity: 1, y: 0 },
}

const UserDropdownList: React.FC<{ setOpen: (open: boolean) => void }> = ({ setOpen }): React.JSX.Element => {
    const { logout } = useAuth()
    const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)
    const dropdownListRef = useRef<HTMLDivElement | null>(null)
    const { handleOnRamp } = useOnRamp()

    /**
     * Handles the click event on the 'Disconnect' dropdown item.
     */
    const handleLogoutClick = async () => {
        try {
            console.log('[user-dropdown] logging out')
            setOpen(false)
            await logout()
            toast.success('Disconnected successfully')
        } catch (error) {
            console.error('[user-dropdown] logout error:', error)
            toast.error('Failed to log out')
        }
    }

    const handleDepositClick = async () => {
        const success = await handleOnRamp()
        if (success) {
            setOpen(false)
        }
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
    const updatedDropdownItemsConfig: DropdownItemConfig[] = dropdownItemsConfig.map(item => {
        switch (item.label) {
            case 'Disconnect':
                return { ...item, onClick: handleLogoutClick }
            case 'Deposit':
                return { ...item, onClick: handleDepositClick }
            default:
                return item
        }
    })

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
                                duration: 0.1,
                                bounce: 0.2,
                            }}
                            style={{ pointerEvents: 'none' }}
                        />
                    )}
                    <UserDropdownItem {...item} />
                </motion.div>
            ))}
        </motion.div>
    )
}

export default UserDropdownList
