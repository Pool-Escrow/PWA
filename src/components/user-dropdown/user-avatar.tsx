/**
 * @file src/components/user-dropdown/user-dropdown.avatar.tsx
 * @description This file contains the `UserDropdownAvatar` component that renders the user's avatar
 * as a trigger for the dropdown menu.
 */
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import frog from '@/../public/images/frog.png'
import Link from 'next/link'
import { useUserStore } from '@/stores/profile.store'
import { useEffect } from 'react'

/**
 * UserDropdownAvatar component renders the user's avatar
 * which acts as a trigger for the dropdown menu.
 *
 * @component
 * @returns {JSX.Element} The rendered user avatar trigger.
 */
const UserAvatar = (): JSX.Element => {
    const { profile, loadProfile } = useUserStore()

    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    return (
        <Avatar className='size-10 cursor-pointer' aria-label='Go to Profile' asChild>
            <Link href='/profile'>
                <AvatarImage alt='User Avatar' src={profile?.avatar || frog.src} />
                <AvatarFallback className='bg-[#d9d9d9]' />
            </Link>
        </Avatar>
    )
}

export default UserAvatar
