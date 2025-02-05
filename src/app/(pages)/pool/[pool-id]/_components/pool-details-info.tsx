import * as React from 'react'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

function PoolDetailsTermsUrl({ termsUrl }: { termsUrl: string }) {
    return (
        <Link href={termsUrl} target='_blank' rel='external noopener noreferrer nofollow'>
            <div className='inline-flex w-full justify-between self-center'>
                Terms and conditions
                <ExternalLinkIcon className='size-4' />
            </div>
        </Link>
    )
}

interface PoolDetailsInfoProps {
    description: string
    price: number
    tokenSymbol: string
    termsUrl?: string
}

export default function PoolDetailsInfo({ description, price, tokenSymbol, termsUrl }: PoolDetailsInfoProps) {
    const items = [
        { title: 'Description', value: description },
        { title: 'Buy-In', value: `$${price} ${tokenSymbol}` },
        { title: 'Terms', value: termsUrl ? <PoolDetailsTermsUrl termsUrl={termsUrl} /> : 'No terms provided' },
    ]

    return (
        <div className='space-y-3 rounded-[2.875rem]'>
            {items.map((item, index) => (
                <PoolDetailsInfoItem key={index} title={item.title} value={item.value} />
            ))}
        </div>
    )
}
function PoolDetailsInfoItem({ title, value }: { title: string; value: React.ReactNode }) {
    return (
        <div className='space-y-4'>
            <div className='w-full border-b-[0.5px] pb-2 text-xs font-semibold'>{title}</div>
            <div>{value}</div>
        </div>
    )
}
