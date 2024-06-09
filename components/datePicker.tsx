'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Dispatch, SetStateAction } from 'react'

interface datePickerProps {
	date: Date
	setDate: Dispatch<SetStateAction<Date | undefined>>
}

// export function DatePicker(props: datePickerProps) {
// 	const [date, setDate] = React.useState<Date>()

// 	return (
// 		<Popover>
// 			<PopoverTrigger asChild>
// 				<Button
// 					variant={'outline'}
// 					className={cn(
// 						'w-[280px] rounded-full justify-start text-left font-normal',
// 						!props.date && 'text-muted-foreground',
// 					)}
// 				>
// 					<CalendarIcon className='mr-2 h-4 w-4' />
// 					{props.date ? format(props.date, 'PPP') : <span>Pick a date</span>}
// 				</Button>
// 			</PopoverTrigger>
// 			<PopoverContent className='w-auto p-0'>
// 				<Calendar
// 					mode='single'
// 					selected={props.date}
// 					onSelect={props.setDate}
// 					initialFocus
// 				/>
// 			</PopoverContent>
// 		</Popover>
// 	)
// }

export function DatePickerDemo({
	date,
	setDate,
}: {
	date: Date
	setDate: Dispatch<SetStateAction<Date>>
}) {
	// const [date, setDate] = React.useState<Date>()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-[280px] justify-start text-left font-normal',
						!date && 'text-muted-foreground',
					)}
				>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{date ? format(date, 'PPP') : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<Calendar
					mode='single'
					selected={date}
					onSelect={setDate}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	)
}
