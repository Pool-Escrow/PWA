'use client'

import type { Variants } from 'motion/react'
import type { LinkProps } from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Link } from 'next-view-transitions'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Icon from '../ui/icon'

interface UserDropdownItemProps {
  href?: LinkProps<unknown>['href']
  icon?: React.ReactNode
  label: string
  onClick?: () => void
}

function UserDropdownItem({
  href,
  icon,
  label,
  onClick,
}: UserDropdownItemProps): React.ReactNode {
  const menuItem = (
    <DropdownMenuLabel
      onClick={onClick}
      className={`
        pointer-events-auto z-10 flex border-separate items-center gap-[6px] p-3 text-xs leading-tight font-normal
        text-black
      `}
    >
      {icon}
      <span>{label}</span>
    </DropdownMenuLabel>
  )

  return (
    <>
      {href != null
        ? (
            <Link href={href} passHref>
              {menuItem}
            </Link>
          )
        : (
            <div>{menuItem}</div>
          )}
    </>
  )
}

const menuVariants: Variants = {
  closed: {
    opacity: 0.3,
    transition: { when: 'afterChildren', staggerChildren: 0.06, duration: 0.1 },
  },
  open: {
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.06, duration: 0.1 },
  },
}

const itemVariants: Variants = {
  closed: { opacity: 0, y: -40 },
  open: { opacity: 1, y: 0 },
}

const UserDropdownList: React.FC<{ setOpen: (open: boolean) => void }> = ({ setOpen }): React.ReactNode => {
  const { logout } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)
  const dropdownListRef = useRef<HTMLDivElement | null>(null)
  //   const { handleOnRamp } = useOnRamp()

  const handleLogoutClick = async () => {
    try {
      console.warn('[user-dropdown] logging out')
      setOpen(false)

      // Invalidate all user-related queries
      void queryClient.invalidateQueries({ queryKey: ['user'] })
      void queryClient.invalidateQueries({ queryKey: ['user-balances'] })
      void queryClient.removeQueries({ queryKey: ['user-balances'] })

      // Wait for logout to complete
      await logout()

      // Navigate after logout is complete
      router.push('/')
      //   toast.success('Disconnected successfully')
    }
    catch (error) {
      console.error('[user-dropdown] logout error:', error)
      //   toast.error('Failed to log out')
    }
  }

  const handleDepositClick = () => {
    // const success = await handleOnRamp()
    // if (success) {
    //   setOpen(false)
    // }
    console.warn('[user-dropdown] depositing')
  }

  const handleMouseEnter = (index: number) => setHoveredItemIndex(index)

  const handleMouseLeave = () => setHoveredItemIndex(null)

  interface DropdownItemConfig {
    label: string
    onClick?: () => void
    [key: string]: unknown
  }

  const dropdownItemsConfig: DropdownItemConfig[] = [
    { label: 'Profile', icon: <Icon.eye size={16} />, href: '/profile' },
    { label: 'Deposit', icon: <Icon.swap size={16} />, onClick: handleDepositClick },
    { label: 'Disconnect', icon: <Icon.wallet size={16} />, onClick: () => void handleLogoutClick() },
  ]

  const updatedDropdownItemsConfig: DropdownItemConfig[] = dropdownItemsConfig.map((item) => {
    switch (item.label) {
      case 'Disconnect':
        return { ...item, onClick: () => void handleLogoutClick() }
      case 'Deposit':
        return { ...item, onClick: () => void handleDepositClick() }
      default:
        return item
    }
  })

  return (
    <motion.div
      initial="closed"
      animate="open"
      exit="closed"
      variants={menuVariants}
      className="pointer-events-none relative w-[213px] cursor-pointer divide-y divide-gray-200"
      ref={dropdownListRef}
      style={{ pointerEvents: 'none' }}
    >
      {updatedDropdownItemsConfig.map((item, index) => (
        <motion.div
          key={item.label}
          className="relative px-3"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          variants={itemVariants}
          style={{ pointerEvents: 'auto' }}
        >
          {hoveredItemIndex === index && (
            <motion.div
              layoutId="active-dropdown-item"
              className="absolute inset-0 z-0 h-full rounded-lg bg-neutral-100 mix-blend-multiply"
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

export default function UserDropdown() {
  const { authenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const container = document.querySelector('main')

  // Don't show dropdown if user is not authenticated
  if (!authenticated) {
    return null
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className={`
        size-8 cursor-pointer rounded-full p-0
        hover:bg-gray-200
        focus:outline-hidden
        active:scale-90 active:bg-gray-300
      `}
      >
        <Icon.ellipsis size={24} />
      </DropdownMenuTrigger>
      {open && <div className="dropdown-backdrop" />}
      <DropdownMenuPortal container={container}>
        <DropdownMenuContent align="end">
          <UserDropdownList setOpen={setOpen} />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
