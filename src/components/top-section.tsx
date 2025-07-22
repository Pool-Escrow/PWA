import PoolsBalance from '@/app/(pages)/pools/_components/pools-balance'
import type { TopBarProps } from './top-bar'

type TopSectionProps = {
    topBarProps?: TopBarProps
}

export default function TopSection({ topBarProps }: TopSectionProps) {
    return (
        <div className='relative left-1/2 ml-[-50vw] w-screen rounded-b-[2rem] bg-[#4078F4]'>
            {/* <TopBar {...topBarProps} /> */}
            <div className='mx-auto flex max-w-screen-md flex-col px-safe-or-6'>
                <PoolsBalance />
                <div className='mt-4'>{/* <ActionBar /> */}</div>
                <div className='h-6' /> {/* 24px bottom spacing */}
            </div>
        </div>
    )
}
