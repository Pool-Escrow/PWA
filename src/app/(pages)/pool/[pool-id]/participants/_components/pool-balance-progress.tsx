import { Progress } from '@/app/_components/ui/progress'

interface PoolDetailsProgressProps {
    current: number
    deposits: number
}

export default function PoolBalanceProgress({ current, deposits }: PoolDetailsProgressProps) {
    return (
        <div className='space-y-2'>
            <div className='inline-flex w-full justify-between'>
                <div className='space-x-1 text-xs'>
                    <span className='font-bold'>{`$${current}`}</span>
                    <span>USDC</span>
                </div>
                <div className='text-xs'>{`${deposits > 0 ? ((current / deposits) * 100).toFixed(0) : 0}% Remaining of $ ${deposits} Prize Pool`}</div>
            </div>

            <div className='overflow-hidden rounded-lg bg-background'>
                <Progress
                    className='bg-[#6993FF33]'
                    indicatorClassName='bg-[#6993FF]'
                    value={(current / deposits) * 100}
                />
            </div>
        </div>
    )
}
