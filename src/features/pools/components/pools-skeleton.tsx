import { Skeleton } from '@/components/ui/skeleton'

export default function PoolSkeleton({ length }: { length: number }) {
    return (
        <div className='mt-3 flex w-full flex-col space-y-4'>
            {Array.from({ length }, (_, index) => (
                <Skeleton
                    key={index}
                    className='flex h-24 animate-skeleton-pulse items-center gap-[14px] overflow-hidden rounded-[2rem] bg-transparent p-3 pr-4'
                    style={{
                        animationDelay: `${index * 0.2}s`,
                        backgroundSize: '200% 100%',
                        backgroundImage: 'linear-gradient(to left, #f4f4f4 8%, #f8f8f8 18%, #f4f4f4 33%)',
                    }}>
                    <Skeleton className='size-[72px] rounded-[16px] bg-[#36a0f7]/10' />
                    <div className='flex flex-col gap-[5px]'>
                        <Skeleton className='h-4 w-10 bg-[#36a0f7]/10' />
                        <Skeleton className='h-4 w-16 bg-[#36a0f7]/10' />
                        <Skeleton className='h-4 w-28 bg-[#36a0f7]/10' />
                    </div>
                </Skeleton>
            ))}
        </div>
    )
}
