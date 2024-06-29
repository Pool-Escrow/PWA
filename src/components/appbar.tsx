import frogImage from '@/../public/images/frog.png'
import keyboardReturnImage from '@/public/images/keyboard_return.svg'
import { useWallets } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon } from 'lucide-react'
import { Comfortaa } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { fetchUserDisplayForAddress } from '@/lib/api/clientAPI'

const comfortaa = Comfortaa({ subsets: ['latin'] })

interface AppBarProps {
    backRoute?: string // Required color property
    pageTitle?: string // Optional size property
    rightMenu?: RightMenu
}

const Appbar = ({ backRoute, pageTitle, rightMenu }: AppBarProps) => {
    const router = useRouter()
    const { wallets } = useWallets()
    const [pageUrl] = useState('')

    const handleAccountClick = (e: any) => {
        router.push('/user-profile')
    }

    const address = wallets?.[0]?.address ?? '0x'
    const { data: profileData } = useQuery({
        queryKey: ['loadProfileImage', wallets?.[0]?.address],
        queryFn: fetchUserDisplayForAddress,
        enabled: wallets.length > 0,
    })

    return (
        <header className='fixed left-0 top-0 z-20 w-full bg-white pt-safe'>
            <nav className='px-safe'>
                <div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
                    <div className='flex w-16'>
                        {backRoute && (
                            <Link href={backRoute as any}>
                                <ChevronLeftIcon height={40} width={40} />
                            </Link>
                        )}
                    </div>
                    <div className='flex flex-1 items-center'>
                        {pageTitle ? (
                            <h1 className={`h-full w-full text-center text-xl font-medium md:text-3xl`}>{pageTitle}</h1>
                        ) : (
                            <Link href='/' className='w-full text-center'>
                                <h1 className={`h-full w-full text-center text-5xl font-bold ${comfortaa.className}`}>
                                    pool
                                </h1>
                            </Link>
                        )}
                    </div>
                    <div className='flex w-16 justify-end space-x-6'>
                        {rightMenu == RightMenu.ProfileImage ||
                            (rightMenu == undefined && (
                                <div>
                                    <button
                                        type='button'
                                        title='Profile'
                                        className='flex flex-col items-center'
                                        onClick={handleAccountClick}>
                                        <Image
                                            src={
                                                profileData?.profileImageUrl
                                                    ? profileData?.profileImageUrl
                                                    : frogImage.src
                                            }
                                            className='h-9 w-9 rounded-full object-cover'
                                            alt='profile image'
                                            width={36}
                                            height={36}
                                        />
                                    </button>
                                </div>
                            ))}
                        {rightMenu == RightMenu.RefundMenu && (
                            <div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <div className='h-12 w-12 rounded-full p-3'>
                                            <svg
                                                width='20'
                                                height='20'
                                                viewBox='0 0 20 20'
                                                fill='white'
                                                xmlns='http://www.w3.org/2000/svg'>
                                                <path
                                                    d='M5.55382 9.99995C5.55382 8.77772 4.55382 7.77772 3.3316 7.77772C2.10937 7.77772 1.10937 8.77772 1.10937 9.99995C1.10937 11.2222 2.10938 12.2222 3.3316 12.2222C4.55382 12.2222 5.55382 11.2222 5.55382 9.99995ZM7.77604 9.99995C7.77604 11.2222 8.77604 12.2222 9.99826 12.2222C11.2205 12.2222 12.2205 11.2222 12.2205 9.99995C12.2205 8.77772 11.2205 7.77772 9.99826 7.77772C8.77604 7.77772 7.77604 8.77772 7.77604 9.99995ZM14.4427 9.99995C14.4427 11.2222 15.4427 12.2222 16.6649 12.2222C17.8872 12.2222 18.8872 11.2222 18.8872 9.99994C18.8872 8.77772 17.8872 7.77772 16.6649 7.77772C15.4427 7.77772 14.4427 8.77772 14.4427 9.99995Z'
                                                    fill='black'
                                                />
                                            </svg>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={0}>
                                        <DropdownMenuItem>
                                            <Link href={`${pageUrl}/refund` as any}>
                                                <div className='flex flex-row items-center justify-center space-x-2'>
                                                    <span>
                                                        <Image
                                                            className='flex h-full w-full'
                                                            src={keyboardReturnImage.src}
                                                            alt='refund'
                                                            fill
                                                        />
                                                    </span>
                                                    <span>Issue refund</span>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                        {rightMenu == RightMenu.ManageParticipants && (
                            <div>
                                <button type='button' title='Profile' className='flex flex-col items-center'>
                                    <Image
                                        src={`${profileData?.profileImageUrl ?? frogImage.src}`}
                                        className='h-9 w-9 rounded-full object-cover'
                                        fill
                                        alt='profile image'
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Appbar

export enum RightMenu {
    ProfileImage = 0,
    RefundMenu = 1,
    ManageParticipants = 2,
}
