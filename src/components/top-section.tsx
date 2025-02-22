import ActionBar from '@/app/(pages)/pools/_components/action-bar'
import PoolsBalance from '@/app/(pages)/pools/_components/pools-balance'
import type { TopBarProps } from './top-bar'
import TopBar from './top-bar'

type TopSectionProps = {
    topBarProps?: TopBarProps
}

export default function TopSection({ topBarProps }: TopSectionProps) {
    return (
        <div className='rounded-b-4xl bg-[#4078F4]'>
            <TopBar {...topBarProps} />
            <div className='flex max-w-screen-md flex-col px-4'>
                <PoolsBalance />
                <div className='mt-6'>
                    <ActionBar />
                </div>
                <div className='h-6' /> {/* 24px bottom spacing */}
            </div>
        </div>
    )
}
