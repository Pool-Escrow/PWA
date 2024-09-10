'use client'

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toZonedTime } from 'date-fns-tz';

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
    { label: '(GMT-12:00) International Date Line West', offset: -720 },
    { label: '(GMT-11:00) Midway Island, Samoa', offset: -660 },
    { label: '(GMT-10:00) Hawaii', offset: -600 },
    { label: '(GMT-09:00) Alaska', offset: -540 },
    { label: '(GMT-08:00) Pacific Time (US & Canada)', offset: -480 },
    { label: '(GMT-07:00) Mountain Time (US & Canada)', offset: -420 },
    { label: '(GMT-06:00) Central Time (US & Canada), Mexico City', offset: -360 },
    { label: '(GMT-05:00) Eastern Time (US & Canada), Bogota, Lima', offset: -300 },
    { label: '(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz', offset: -240 },
    { label: '(GMT-03:00) Brazil, Buenos Aires, Georgetown', offset: -180 },
    { label: '(GMT-02:00) Mid-Atlantic', offset: -120 },
    { label: '(GMT-01:00) Azores, Cape Verde Islands', offset: -60 },
    { label: '(GMT) Western Europe Time, London, Lisbon, Casablanca', offset: 0 },
    { label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris', offset: 60 },
    { label: '(GMT+02:00) Kaliningrad, South Africa', offset: 120 },
    { label: '(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg', offset: 180 },
    { label: '(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi', offset: 240 },
    { label: '(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent', offset: 300 },
    { label: '(GMT+06:00) Almaty, Dhaka, Colombo', offset: 360 },
    { label: '(GMT+07:00) Bangkok, Hanoi, Jakarta', offset: 420 },
    { label: '(GMT+08:00) Beijing, Perth, Singapore, Hong Kong', offset: 480 },
    { label: '(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk', offset: 540 },
    { label: '(GMT+10:00) Eastern Australia, Guam, Vladivostok', offset: 600 },
    { label: '(GMT+11:00) Magadan, Solomon Islands, New Caledonia', offset: 660 },
    { label: '(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka', offset: 720 },
]

export default function DateTimeRange({ name }: DateTimeRangeProps) {
    const [userTimezone, setUserTimezone] = useState(timezones[0])
    const [localValue, setLocalValue] = useState<DateTimeRangeValue>(getDefaultDateTimeValue())

    useEffect(() => {
        // Function to get the user's timezone offset in minutes
        const getUserTimezoneOffset = () => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const now = new Date();
            const zonedTime = toZonedTime(now, timeZone);
            const offset = zonedTime.getTimezoneOffset();
            return -offset; // Convert to positive offset in minutes
        };

        // Function to find the matching timezone from the list
        const findMatchingTimezone = () => {
            const userOffset = getUserTimezoneOffset();
            return timezones.find(tz => tz.offset === userOffset);
        };

        const detectUserTimezone = () => {
            const timezone = findMatchingTimezone() || timezones[12] // Default to GMT if not found
            console.log(`Detected timezone: ${timezone.label} (offset: ${timezone.offset} minutes)`)
            return timezone
        }

        const detectedTimezone = detectUserTimezone()
        setUserTimezone(detectedTimezone)

        // Update localValue with the detected timezone
        setLocalValue(() => ({
            start: adjustTimeForTimezone(detectedTimezone.offset),
            end: adjustTimeForTimezone(detectedTimezone.offset)
        }))
    }, [])


    const getCurrentUTCTime = () => {
        const now = new Date()
        return new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes()
        ))
    }

    // Add this helper function to adjust time for the detected timezone
    const adjustTimeForTimezone = (offsetMinutes: number) => {
        const utcDate = getCurrentUTCTime()
        utcDate.setMinutes(utcDate.getMinutes() + offsetMinutes)
        return utcDate.toISOString().split('.')[0]
    }

    const updateValue = (field: 'start' | 'end', type: 'date' | 'time', newValue: string) => {
        const [currentDate, currentTime] = localValue[field].split('T')
        const updatedValue = type === 'date' ? `${newValue}T${currentTime}` : `${currentDate}T${newValue}`

        setLocalValue(prevValue => ({
            ...prevValue,
            [field]: updatedValue,
        }))
    }

    const formatDateTimeForInput = (isoString: string) => {
        const date = new Date(isoString)
        return {
            date: date.toISOString().split('T')[0],
            time: date.toTimeString().slice(0, 5)
        }
    }

    return (
        <div className="space-y-4">
            <input type='hidden' name={name} value={JSON.stringify(localValue)} />
            <input type='hidden' name={`${name}_timezone`} value={JSON.stringify(userTimezone)} />
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Timezone</span>
                <Select value={userTimezone.offset.toString()} onValueChange={(value) => {
                    const selectedTimezone = timezones.find(tz => tz.offset.toString() === value)
                    if (selectedTimezone) {
                        setUserTimezone(selectedTimezone)
                        // Update localValue when timezone changes
                        setLocalValue(() => ({
                            start: adjustTimeForTimezone(selectedTimezone.offset),
                            end: adjustTimeForTimezone(selectedTimezone.offset)
                        }))
                    }
                }}>
                    <SelectTrigger className='w-[340px] text-xs flex justify-between items-center'>
                        <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map((tz) => (
                            <SelectItem 
                                key={tz.offset} 
                                value={tz.offset.toString()} 
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
                            value={formatDateTimeForInput(localValue.start).date}
                            onChange={e => updateValue('start', 'date', e.target.value)}
                            autoComplete='off'
                            prefix='date'
                        />
                    </div>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-white text-center text-xs font-medium'
                            type='time'
                            value={formatDateTimeForInput(localValue.start).time}
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
                            value={formatDateTimeForInput(localValue.end).date}
                            onChange={e => updateValue('end', 'date', e.target.value)}
                            autoComplete='off'
                            prefix='date'
                        />
                    </div>
                    <div className='relative'>
                        <Input
                            className='cursor-pointer bg-white text-center text-xs font-medium'
                            type='time'
                            value={formatDateTimeForInput(localValue.end).time}
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