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
    <div className='relative mb-2 h-10'>
        <div className='absolute left-4 top-[1px] z-10 flex h-full w-4 items-center'>
            <SearchIcon size={16} />
        </div>
        {isAdmin && (
            <Link
                href={`/pool/${poolId}/participants/`}
                className='absolute right-2 top-[1px] z-10 flex h-10 w-6 items-center'>
                <QrCodeIcon size={16} />
            </Link>
        )}
        <Input
            type='text'
            value={query}
            onChange={onChange}
            placeholder='Search'
            className='mb-2 h-10 rounded-full px-10'
        />
    </div>
)

export default SearchBar
