import { getRelativeTimeString } from '@/lib/utils/time-date'
import Image from 'next/image'

export default function PoolCard({
	name,
	startDate,
}: {
	name: string
	startDate: Date
}) {
	return (
		<div className='bg-[#f4f4f4] rounded-[2rem] h-[6rem] flex gap-[14px] p-[0.75rem] pr-[1rem] items-center'>
			<div className='size-[72px] rounded-[16px] overflow-hidden relative shrink-0'>
				<Image
					src='/images/frog.png'
					alt='frog'
					style={{ objectFit: 'contain' }}
					fill
				/>
				<span className='pr-2 flex items-center justify-center absolute bottom-0 bg-black/40 backdrop-blur-md w-full text-white text-[10px] before:size-[5px] before:rounded-full before:bg-[#24ff00] before:mr-[4px]'>
					Live
				</span>
			</div>
			<div className='flex flex-col gap-[5px] truncate'>
				<h1 className='font-semibold text-sm truncate'>{name}</h1>
				<span className='font-medium text-xs truncate tracking-tight'>
					0/200 Registered
				</span>
				<span className='font-medium text-xs truncate tracking-tight'>
					Starts in {getRelativeTimeString(startDate)}
				</span>
			</div>
		</div>
	)
}
