/**
 * @file src/components/user-dropdown/user-dropdown.avatar.tsx
 * @description This file contains the `UserDropdownAvatar` component that renders the user's avatar
 * as a trigger for the dropdown menu.
 */

import tripleDots from '@/../public/images/tripleDots.svg'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/**
 * UserDropdownAvatar component renders the user's avatar
 * which acts as a trigger for the dropdown menu.
 *
 * @component
 * @returns {JSX.Element} The rendered user avatar trigger.
 */
const RegisteredDropdownButton = (): JSX.Element => (
    <Avatar className='mb-3 h-[46px] w-[46px] cursor-pointer' aria-label='User menu'>
        <AvatarImage className='bg-cta px-2' alt='Menu' src={tripleDots.src} />
        <AvatarFallback className='bg-[#d9d9d9]' />
    </Avatar>
)

export default RegisteredDropdownButton
