import { Input } from '@/components/ui/input'
import type { ChangeEvent } from 'react'

export type DateTimeRangeValue = {
	start: string
	end: string
}

interface DateTimeRangeProps {
	value: DateTimeRangeValue
	setValue: React.Dispatch<React.SetStateAction<DateTimeRangeValue>>
}

export const DateTimeRange = ({ value, setValue }: DateTimeRangeProps) => {
	// eventDate sample: '2024-05-09T23:59/2024-05-10T23:59',
	const { start, end } = value
	const [startDate, startTime] = start.split('T')
	const [endDate, endTime] = end.split('T')

	const updateStartDate = (e: ChangeEvent<HTMLInputElement>) => {
		setValue((previous: DateTimeRangeValue) => ({
			...previous,
			start: `${e.target.value}T${startTime}`,
		}))
	}

	const updateStartTime = (e: ChangeEvent<HTMLInputElement>) => {
		setValue((previous: DateTimeRangeValue) => ({
			...previous,
			start: `${startDate}T${e.target.value}`,
		}))
	}

	const updateEndDate = (e: ChangeEvent<HTMLInputElement>) => {
		setValue((previous: DateTimeRangeValue) => ({
			...previous,
			end: `${e.target.value}T${endTime}`,
		}))
	}

	const updateEndTime = (e: ChangeEvent<HTMLInputElement>) => {
		setValue((previous: DateTimeRangeValue) => ({
			...previous,
			end: `${endDate}T${e.target.value}`,
		}))
	}

	return (
		<>
			<div className='flex flex-row items-center justify-between border-b border-[#ebebeb] pb-2'>
				{/* the div is required to set the width of the input */}
				<span className='text-xs font-medium'>Starts</span>
				<div className='inline-flex flex-row flex-nowrap gap-1'>
					<div>
						<Input
							className='bg-transparent text-center text-xs font-medium'
							type='date'
							value={startDate}
							onChange={updateStartDate}
							autoComplete='off'
							prefix='date'
						/>
					</div>
					<div>
						<Input
							className='bg-white text-xs font-medium'
							type='time'
							value={startTime}
							onChange={updateStartTime}
							autoComplete='off'
						/>
					</div>
				</div>
			</div>
			<div className='flex flex-row items-center justify-between border-b border-[#ebebeb] py-2'>
				{/* the div is required to set the width of the input */}
				<span className='text-xs font-medium'>Ends</span>
				<div className='inline-flex flex-row flex-nowrap gap-1'>
					<div>
						<Input
							className='bg-transparent text-center text-xs font-medium'
							type='date'
							value={endDate}
							onChange={updateEndDate}
							autoComplete='off'
							prefix='date'
						/>
					</div>
					<div>
						<Input
							className='bg-white text-xs font-medium'
							type='time'
							value={endTime}
							onChange={updateEndTime}
							autoComplete='off'
						/>
					</div>
				</div>
			</div>
		</>
	)
}
