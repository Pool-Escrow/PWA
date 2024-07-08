/**
 * @file src/components/user-dropdown/user-dropdown.list.tsx
 * @description This file contains the `UserDropdownList` component that renders the list of items
 * for the user dropdown menu including options like 'Edit Profile', 'Request a refund', and 'Disconnect'.
 */

'use client'

import { poolAbi, poolAddress } from '@/types/contracts'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getAbiItem } from 'viem'
import { useDisconnect } from 'wagmi'
import { useSponsoredTxn } from '../../_client/hooks/use-sponsored-txn'
import { wagmi } from '../../_client/providers/configs'
import RegisteredDropdownItem from './registered-dropdown.item'
import type { RegisteredDropdownItemConfig } from './registered-dropdown.list.config'
import { dropdownItemsConfig } from './registered-dropdown.list.config'

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
const RegisteredDropdownList: React.FC<{ setOpen: (open: boolean) => void; poolId: string }> = ({
    setOpen,
    poolId,
}): JSX.Element => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disconnect } = useDisconnect()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { logout } = usePrivy()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter()
    const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)
    const dropdownListRef = useRef<HTMLDivElement | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { writeContract, data: hash, isPending } = useWriteContract()
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        isError,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: registerError,
        data: txData,
    } = useWaitForTransactionReceipt({
        hash,
    })
    const queryClient = useQueryClient()

    const { wallets } = useWallets()
    const { sponsoredTxn } = useSponsoredTxn()
    const account = useAccount()
    const accountAddress = account?.address ?? '0x'
    /**
     * Handles the click event on the 'Disconnect' dropdown item.
     */
    const handleUnregisterClick = () => {
        // close the dropdown menu:
        setOpen(false)

        // TODO: Call the unregister function

        try {
            // const [deposit] = [BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson.toString() ?? 0)]
            console.log('unregister')
            console.log('unregister poolId', BigInt(poolId))

            const UnregisterPoolFunction = getAbiItem({
                abi: poolAbi,
                name: 'selfRefund',
            })
            if (
                wallets[0].walletClientType === 'coinbase_smart_wallet' ||
                wallets[0].walletClientType === 'coinbase_wallet'
            ) {
                sponsoredTxn([
                    {
                        address: poolAddress[wagmi.config.state.chainId as ChainId],
                        abi: [UnregisterPoolFunction],
                        functionName: 'selfRefund',
                        args: [BigInt(poolId)],
                    },
                ])
            } else {
                writeContract({
                    address: poolAddress[wagmi.config.state.chainId as ChainId],
                    abi: [UnregisterPoolFunction],
                    functionName: 'selfRefund',
                    args: [BigInt(poolId)],
                })
            }
        } catch (error) {
            console.log('Unregister Error', error)
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
    const updatedDropdownItemsConfig: RegisteredDropdownItemConfig[] = dropdownItemsConfig.map(item =>
        item.label === 'Unregister from Pool' ? { ...item, onClick: handleUnregisterClick } : item,
    )

    useEffect(() => {
        console.log('isError', isError)
        console.log('isConfirmed', isConfirmed)
        console.log('isConfirming', isConfirming)
        console.log('hash', hash)
        console.log('txData', txData)
        let toastId
        if (isConfirming) {
            toastId = toast.loading('Unregistering from Pool', {
                description: 'Unjoining pool...',
            })
        }
        if (hash && isConfirmed) {
            toast.dismiss(toastId)

            void queryClient.invalidateQueries({
                queryKey: ['poolDetails', BigInt(poolId), wagmi.config.state.chainId],
            })
            void queryClient.invalidateQueries({
                queryKey: ['allowance', accountAddress],
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isError, isConfirmed, isConfirming, hash, txData])

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
