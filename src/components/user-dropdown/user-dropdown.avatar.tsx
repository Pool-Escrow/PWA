/**
 * @file src/components/user-dropdown/user-dropdown.avatar.tsx
 * @description This file contains the `UserDropdownAvatar` component that renders the user's avatar
 * as a trigger for the dropdown menu.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import frog from '@/../public/images/frog.png'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

/**
 * UserDropdownAvatar component renders the user's avatar
 * which acts as a trigger for the dropdown menu.
 *
 * @component
 * @returns {JSX.Element} The rendered user avatar trigger.
 */
const UserDropdownAvatar = (): JSX.Element => (
    <Avatar className='size-10 cursor-pointer' aria-label='User menu'>
        <AvatarImage alt='User Avatar' src={frog.src} />
        <AvatarFallback className='bg-[#d9d9d9]' />
    </Avatar>
)

export default UserDropdownAvatar
