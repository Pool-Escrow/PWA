import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

function PoolDetailsTermsUrl({ termsUrl }: { termsUrl: string }) {
    return (
        <Link href={termsUrl} passHref legacyBehavior>
            <a target='_blank' rel='external noopener noreferrer nofollow' className='self-center'>
                <div className='mt-4 inline-flex w-full justify-between'>
                    {termsUrl}
                    <ExternalLinkIcon className='size-4' />
                </div>
            </a>
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
        <div className='space-y-3 rounded-[2.875rem] p-5'>
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
