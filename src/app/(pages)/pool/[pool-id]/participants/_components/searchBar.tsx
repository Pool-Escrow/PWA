'use client'

import Link from 'next/link'
import { QrCodeIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/app/_components/ui/input'

const SearchBar = ({
    query,
    onChange,
    poolId,
    isAdmin,
}: {
    query: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    poolId: string
    isAdmin: boolean
}) => (
    <div className='relative mb-2 h-[38px]'>
        <div className='absolute left-4 z-10 flex h-full items-center'>
            <SearchIcon size={14} />
        </div>
        {isAdmin && (
            <Link
                href={`/pool/${poolId}/participants/`}
                className='absolute right-[10px] z-10 flex h-10 w-6 items-center'>
                <QrCodeIcon size={18} />
            </Link>
        )}
        <Input
            type='text'
            value={query}
            onChange={onChange}
            placeholder='Search'
            className='mb-2 h-[38px] rounded-full px-[37px] placeholder:text-sm placeholder:font-medium placeholder:text-[#B2B2B2] focus:outline-none'
        />
    </div>
)

export default SearchBar
