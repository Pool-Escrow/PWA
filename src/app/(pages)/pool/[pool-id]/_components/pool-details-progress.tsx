import ShineBorder from '@/app/_components/shine-border'
import { Progress } from '@/app/_components/ui/progress'

interface PoolDetailsProgressProps {
    current: number
    goal: number
    description?: string
}

export default function PoolDetailsProgress({
    current,
    goal,
    description = `Goal of $${goal || '🎁'} Prize Pool`,
}: PoolDetailsProgressProps) {
    const isComplete = current >= goal && current > 0

    return (
        <div className='space-y-2'>
            <div className='inline-flex w-full justify-between'>
                <div className='space-x-1 text-xs'>
                    <span className='font-bold'>{`$${current}`}</span>
                    <span>USDC</span>
                </div>
                <div className='text-xs'>{description}</div>
            </div>
            {isComplete ? (
                <ShineBorder className='overflow-hidden' color={['#5472E9', '#5D7AF2', '#5A77EE']} borderWidth={2}>
                    <div className='bg-background'>
                        <Progress value={100} className='border-none' />
                    </div>
                </ShineBorder>
            ) : (
                <div className='overflow-hidden rounded-lg bg-background'>
                    <Progress value={(current / goal) * 100} />
                </div>
            )}
        </div>
    )
}
