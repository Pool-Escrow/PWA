'use client'

import { Input } from '@/components/ui/input'
import { useEffect, useState, type ChangeEvent } from 'react'

export type DateTimeRangeValue = {
    start: string
    end: string
}

interface DateTimeRangeProps {
    value: DateTimeRangeValue
    setValue: React.Dispatch<React.SetStateAction<DateTimeRangeValue>>
}

const getDefaultDateTimeValue = () => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return {
        start: now.toISOString().split('.')[0],
        end: tomorrow.toISOString().split('.')[0],
    }
}

export const DateTimeRange = ({ value, setValue }: DateTimeRangeProps) => {
    // eventDate sample: '2024-05-09T23:59/2024-05-10T23:59',
    const [localValue, setLocalValue] = useState<DateTimeRangeValue>(() => {
        if (value && value.start && value.end) {
            return value
        }
        return getDefaultDateTimeValue()
    })

    useEffect(() => {
        if (value && value.start && value.end) {
            setLocalValue(value)
        }
    }, [value])

    const updateValue = (field: 'start' | 'end', type: 'date' | 'time', newValue: string) => {
        const [currentDate, currentTime] = localValue[field].split('T')
        const updatedValue = type === 'date' ? `${newValue}T${currentTime}` : `${currentDate}T${newValue}`

        const newLocalValue = {
            ...localValue,
            [field]: updatedValue,
        }
        setLocalValue(newLocalValue)
        setValue(newLocalValue)
    }

    return (
        <>
            <div className='flex flex-row items-center justify-between border-b border-[#ebebeb] pb-2 text-black'>
                {/* the div is required to set the width of the input */}
                <span className='text-xs font-medium'>Starts</span>
                <div className='inline-flex flex-row flex-nowrap gap-1'>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-transparent pl-0 pr-0 text-center text-xs font-medium'
                            type='date'
                            value={localValue.start.split('T')[0]}
                            onChange={e => updateValue('start', 'date', e.target.value)}
                            autoComplete='off'
                            prefix='date'
                        />
                    </div>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-white text-center text-xs font-medium'
                            type='time'
                            value={localValue.start.split('T')[1].substring(0, 5)}
                            onChange={e => updateValue('start', 'time', e.target.value)}
                            autoComplete='off'
                            step={60}
                        />
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between border-b border-[#ebebeb] py-2 text-black'>
                {/* the div is required to set the width of the input */}
                <span className='text-xs font-medium'>Ends</span>
                <div className='inline-flex flex-row flex-nowrap gap-1'>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-transparent pl-0 pr-0 text-center text-xs font-medium'
                            type='date'
                            value={localValue.end.split('T')[0]}
                            onChange={e => updateValue('end', 'date', e.target.value)}
                            autoComplete='off'
                            prefix='date'
                        />
                    </div>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-white text-center text-xs font-medium'
                            type='time'
                            value={localValue.end.split('T')[1].substring(0, 5)}
                            onChange={e => updateValue('end', 'time', e.target.value)}
                            autoComplete='off'
                            step={60}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
