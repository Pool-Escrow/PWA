/**
 * @file src/components/user-dropdown/user-dropdown.list.tsx
 * @description This file contains the `UserDropdownList` component that renders the list of items
 * for the user dropdown menu including options like 'Edit Profile', 'Request a refund', and 'Disconnect'.
 */

'use client'

import useTransactions from '@/app/_client/hooks/use-transactions'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { motion, type Variants } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getAbiItem } from 'viem'
import RegisteredDropdownItem from './registered-dropdown.item'
import type { RegisteredDropdownItemConfig } from './registered-dropdown.list.config'
import { dropdownItemsConfig } from './registered-dropdown.list.config'

/**
 * Variants for the dropdown menu animation using motion/react.
 */
const menuVariants: Variants = {
    closed: {
        opacity: 0,
        transition: {
            when: 'afterChildren',
            staggerChildren: 0.1,
            type: 'spring',
            bounce: 0.2,
        },
    },
    open: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.1,
            type: 'spring',
            bounce: 0.2,
        },
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
 * @returns {React.JSX.Element} The rendered user dropdown list.
 */
const RegisteredDropdownList: React.FC<{ setOpen: (open: boolean) => void; poolId: string }> = ({
    setOpen,
    poolId,
}): React.JSX.Element => {
    const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)
    const dropdownListRef = useRef<HTMLDivElement | null>(null)
    const { executeTransactions, isPending, isConfirmed } = useTransactions()

    const handleUnregisterClick = () => {
        setOpen(false)

        const UnregisterPoolFunction = getAbiItem({
            abi: poolAbi,
            name: 'selfRefund',
        })

        executeTransactions(
            [
                {
                    address: currentPoolAddress,
                    abi: [UnregisterPoolFunction],
                    functionName: UnregisterPoolFunction.name,
                    args: [BigInt(poolId)],
                },
            ],
            {
                type: 'UNREGISTER_POOL',
                onSuccess: () => {
                    console.log('Successfully unregistered from pool')
                },
            },
        ).catch(error => {
            console.log('unregisterPool Error', error)
        })
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
    const updatedDropdownItemsConfig: RegisteredDropdownItemConfig[] = dropdownItemsConfig.map(item =>
        item.label === 'Unregister from Pool' ? { ...item, onClick: handleUnregisterClick } : item,
    )

    useEffect(() => {
        let toastId
        if (isPending) {
            toastId = toast.loading('Unregistering from Pool', {
                description: 'Unjoining pool...',
                richColors: true,
            })
        }
        if (isConfirmed) {
            toast.dismiss(toastId)

            // TODO: invalidate the correct queries
            // void queryClient.invalidateQueries({
            //     queryKey: ['poolDetails', BigInt(poolId), getConfig().state.chainId],
            // })
            // void queryClient.invalidateQueries({
            //     queryKey: ['allowance', accountAddress],
            // })
        }
    }, [isConfirmed, isPending])

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
                    <RegisteredDropdownItem {...item} />
                </motion.div>
            ))}
        </motion.div>
    )
}

export default RegisteredDropdownList
