'use client'

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export type DateTimeRangeValue = {
    start: string
    end: string
}

interface DateTimeRangeProps {
    name: string
}

const getDefaultDateTimeValue = () => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return {
        start: now.toISOString().split('.')[0],
        end: tomorrow.toISOString().split('.')[0],
    }
}

const timezones = [
    { value: 'Etc/GMT+12', label: '(GMT-12:00) International Date Line West', offset: -720 },
    { value: 'Etc/GMT+11', label: '(GMT-11:00) Midway Island, Samoa', offset: -660 },
    { value: 'Etc/GMT+10', label: '(GMT-10:00) Hawaii', offset: -600 },
    { value: 'Etc/GMT+9', label: '(GMT-09:00) Alaska', offset: -540 },
    { value: 'Etc/GMT+8', label: '(GMT-08:00) Pacific Time (US & Canada)', offset: -480 },
    { value: 'Etc/GMT+7', label: '(GMT-07:00) Mountain Time (US & Canada)', offset: -420 },
    { value: 'Etc/GMT+6', label: '(GMT-06:00) Central Time (US & Canada), Mexico City', offset: -360 },
    { value: 'Etc/GMT+5', label: '(GMT-05:00) Eastern Time (US & Canada), Bogota, Lima', offset: -300 },
    { value: 'Etc/GMT+4', label: '(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz', offset: -240 },
    { value: 'Etc/GMT+3', label: '(GMT-03:00) Brazil, Buenos Aires, Georgetown', offset: -180 },
    { value: 'Etc/GMT+2', label: '(GMT-02:00) Mid-Atlantic', offset: -120 },
    { value: 'Etc/GMT+1', label: '(GMT-01:00) Azores, Cape Verde Islands', offset: -60 },
    { value: 'Etc/GMT+0', label: '(GMT) Western Europe Time, London, Lisbon, Casablanca', offset: 0 },
    { value: 'Etc/GMT-1', label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris', offset: 60 },
    { value: 'Etc/GMT-2', label: '(GMT+02:00) Kaliningrad, South Africa', offset: 120 },
    { value: 'Etc/GMT-3', label: '(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg', offset: 180 },
    { value: 'Etc/GMT-4', label: '(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi', offset: 240 },
    { value: 'Etc/GMT-5', label: '(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent', offset: 300 },
    { value: 'Etc/GMT-6', label: '(GMT+06:00) Almaty, Dhaka, Colombo', offset: 360 },
    { value: 'Etc/GMT-7', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta', offset: 420 },
    { value: 'Etc/GMT-8', label: '(GMT+08:00) Beijing, Perth, Singapore, Hong Kong', offset: 480 },
    { value: 'Etc/GMT-9', label: '(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk', offset: 540 },
    { value: 'Etc/GMT-10', label: '(GMT+10:00) Eastern Australia, Guam, Vladivostok', offset: 600 },
    { value: 'Etc/GMT-11', label: '(GMT+11:00) Magadan, Solomon Islands, New Caledonia', offset: 660 },
    { value: 'Etc/GMT-12', label: '(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka', offset: 720 },
]

export default function DateTimeRange({ name }: DateTimeRangeProps) {
    const [userTimezone, setUserTimezone] = useState(timezones[0].value)
    const [localValue, setLocalValue] = useState<DateTimeRangeValue>(getDefaultDateTimeValue())

    useEffect(() => {
        const detectUserTimezone = () => {
            const timezoneOffset = new Date().getTimezoneOffset()
            const offsetMinutes = -timezoneOffset // Negate to match our timezones array format
            
            const closestTimezone = timezones.reduce((prev, curr) => 
                Math.abs(curr.offset - offsetMinutes) < Math.abs(prev.offset - offsetMinutes) ? curr : prev
            )
            
            console.log(`Detected timezone: ${closestTimezone.value} (offset: ${offsetMinutes} minutes)`)
            return closestTimezone.value
        }

        const detectedTimezone = detectUserTimezone()
        setUserTimezone(detectedTimezone)
    }, [])

    const updateValue = (field: 'start' | 'end', type: 'date' | 'time', newValue: string) => {
        const [currentDate, currentTime] = localValue[field].split('T')
        const updatedValue = type === 'date' ? `${newValue}T${currentTime}` : `${currentDate}T${newValue}`

        setLocalValue(prevValue => ({
            ...prevValue,
            [field]: updatedValue,
        }))
    }

    const formatToLocalTime = (isoString: string) => {
        const date = new Date(isoString)
        const userTimezoneOffset = timezones.find(tz => tz.value === userTimezone)?.offset || 0
        const localDate = new Date(date.getTime() + userTimezoneOffset * 60000)
        
        const year = localDate.getUTCFullYear()
        const month = String(localDate.getUTCMonth() + 1).padStart(2, '0')
        const day = String(localDate.getUTCDate()).padStart(2, '0')
        const hours = String(localDate.getUTCHours()).padStart(2, '0')
        const minutes = String(localDate.getUTCMinutes()).padStart(2, '0')
        
        return {
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`
        }
    }

    return (
        <div className="space-y-4">
            <input type='hidden' name={name} value={JSON.stringify(localValue)} />
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Timezone</span>
                <Select value={userTimezone} onValueChange={setUserTimezone}>
                    <SelectTrigger className='w-[340px] text-xs flex justify-between items-center'>
                        <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map((tz) => (
                            <SelectItem 
                                key={tz.value} 
                                value={tz.value} 
                                className='text-xs flex items-center'
                            >
                                <div className="truncate text-left w-full">
                                    {tz.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Starts</span>
                <div className='inline-flex flex-row flex-nowrap gap-1'>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-transparent px-0 text-center text-xs font-medium'
                            type='date'
                            value={formatToLocalTime(localValue.start).date}
                            onChange={e => updateValue('start', 'date', e.target.value)}
                            autoComplete='off'
                            prefix='date'
                        />
                    </div>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-white text-center text-xs font-medium'
                            type='time'
                            value={formatToLocalTime(localValue.start).time}
                            onChange={e => updateValue('start', 'time', e.target.value)}
                            autoComplete='off'
                            step={60}
                        />
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Ends</span>
                <div className='inline-flex flex-row flex-nowrap gap-1'>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-transparent px-0 text-center text-xs font-medium'
                            type='date'
                            value={formatToLocalTime(localValue.end).date}
                            onChange={e => updateValue('end', 'date', e.target.value)}
                            autoComplete='off'
                            prefix='date'
                        />
                    </div>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-white text-center text-xs font-medium'
                            type='time'
                            value={formatToLocalTime(localValue.end).time}
                            onChange={e => updateValue('end', 'time', e.target.value)}
                            autoComplete='off'
                            step={60}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}