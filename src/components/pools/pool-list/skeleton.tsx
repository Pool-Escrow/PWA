import { Skeleton } from '@/components/ui/skeleton'

export default function PoolListSkeleton({ limit }: { limit: number }) {
	return (
		<div className='flex flex-col flex-grow mt-3 w-full h-full space-y-4'>
			{Array.from({ length: limit }, (_, index) => (
				<Skeleton
					key={index}
					className='bg-[#f4f4f4] rounded-[2rem] h-[6rem] flex gap-[14px] p-[0.75rem] pr-[1rem] items-center'
				>
					<Skeleton className='size-[72px] rounded-[16px] bg-[#36a0f7]/20' />
					<div className='flex flex-col gap-[5px]'>
						<Skeleton className='w-10 h-4 bg-[#36a0f7]/20' />
						<Skeleton className='w-16 h-4 bg-[#36a0f7]/20' />
						<Skeleton className='w-28 h-4 bg-[#36a0f7]/20' />
					</div>
				</Skeleton>
			))}
		</div>
	)
}
