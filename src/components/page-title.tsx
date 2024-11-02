import PoolTopLogo from '@/app/_components/icons/pool-top-logo'
import Link from 'next/link'

export default function PageTitle({ title }: { title?: string }) {
    return (
        <Link href='/'>
            <h1 className='text-[0.875rem] font-semibold'>
                {title ?? (
                    <div className='h-8 w-24'>
                        <PoolTopLogo />
                    </div>
                )}
            </h1>
        </Link>
    )
}
