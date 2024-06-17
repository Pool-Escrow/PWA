import { getStatusString } from '@/lib/utils/get-relative-date'
import { cn } from '@/lib/utils/tailwind'
import Image from 'next/image'

export default function PoolCard({ name, endTime, startTime, status }: Pool) {
	return (
		<div className='bg-[#f4f4f4] rounded-[2rem] h-[6rem] flex gap-[14px] p-[0.75rem] pr-[1rem] items-center'>
			<div className='size-[72px] rounded-[16px] overflow-hidden relative shrink-0'>
				<Image
					src='/images/frog.png'
					alt='frog'
					style={{ objectFit: 'contain' }}
					fill
					sizes='72px'
					priority
				/>
				{status !== 'past' && (
					<div
						className={cn(
							'absolute bottom-0 bg-black/40 backdrop-blur-md text-white text-[10px] w-full text-center flex items-center justify-center',
							status === 'live' &&
								'before:rounded-full before:bg-[#24ff00] before:size-[5px] before:mr-[4px] pr-[9px] before:animate-pulse',
						)}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</div>
				)}
			</div>
			<div className='flex flex-col gap-[5px] truncate'>
				<h1 className='font-semibold text-sm truncate'>{name}</h1>
				<span className='font-medium text-xs truncate tracking-tight'>
					0/200 Registered
				</span>
				<span className='font-medium text-xs truncate tracking-tight'>
					{getStatusString({ status, startTime, endTime })}
				</span>
			</div>
		</div>
	)
}
