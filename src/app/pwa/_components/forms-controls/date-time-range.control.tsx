'use client'

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { format, fromZonedTime, toZonedTime } from 'date-fns-tz';

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
        start: now.toISOString(),
        end: tomorrow.toISOString(),
    }
}

const timezones = [
    { label: '(GMT-12:00) International Date Line West', timeZone: 'Etc/GMT+12', offset: 720 },
    { label: '(GMT-11:00) Midway Island, Samoa', timeZone: 'Pacific/Midway', offset: 660 },
    { label: '(GMT-10:00) Hawaii', timeZone: 'Pacific/Honolulu', offset: 600 },
    { label: '(GMT-09:00) Alaska', timeZone: 'Pacific/Gambier', offset: 540 },
    { label: '(GMT-08:00) Pacific Time (US & Canada)', timeZone: 'Etc/GMT+8', offset: 480 },
    { label: '(GMT-07:00) Mountain Time (US & Canada)', timeZone: 'Etc/GMT+7', offset: 420 },
    { label: '(GMT-06:00) Central Time (US & Canada)', timeZone: 'Etc/GMT+6', offset: 360 },
    { label: '(GMT-05:00) Eastern Time (US & Canada)', timeZone: 'Etc/GMT+5', offset: 300 },
    { label: '(GMT-04:00) Atlantic Time (Canada)', timeZone: 'Etc/GMT+4', offset: 240 },
    { label: '(GMT-03:00) Buenos Aires, Georgetown', timeZone: 'America/Argentina/Buenos_Aires', offset: 180 },
    { label: '(GMT-02:00) Mid-Atlantic', timeZone: 'Etc/GMT+2', offset: 120 },
    { label: '(GMT-01:00) Azores', timeZone: 'Etc/GMT+1', offset: 60 },
    { label: '(GMT+00:00) London, Lisbon, Casablanca', timeZone: 'Etc/GMT', offset: 0 },
    { label: '(GMT+01:00) Berlin, Stockholm, Rome, Bern, Brussels', timeZone: 'Etc/GMT-1', offset: -60 },
    { label: '(GMT+02:00) Athens, Helsinki, Istanbul, Cairo, E. Europe', timeZone: 'Etc/GMT-2', offset: -120 },
    { label: '(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg', timeZone: 'Europe/Moscow', offset: -180 },
    { label: '(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi', timeZone: 'Asia/Dubai', offset: -240 },
    { label: '(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent', timeZone: 'Asia/Karachi', offset: -300 },
    { label: '(GMT+06:00) Almaty, Dhaka, Colombo', timeZone: 'Asia/Dhaka', offset: -360 },
    { label: '(GMT+07:00) Bangkok, Hanoi, Jakarta', timeZone: 'Asia/Bangkok', offset: -420 },
    { label: '(GMT+08:00) Beijing, Perth, Singapore, Hong Kong', timeZone: 'Asia/Shanghai', offset: -480 },
    { label: '(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk', timeZone: 'Asia/Tokyo', offset: -540 },
    { label: '(GMT+10:00) Eastern Australia, Guam, Vladivostok', timeZone: 'Australia/Sydney', offset: -600 },
    { label: '(GMT+11:00) Magadan, Solomon Islands, New Caledonia', timeZone: 'Pacific/Guadalcanal', offset: -660 },
    { label: '(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka', timeZone: 'Pacific/Auckland', offset: -720 },
];

export default function DateTimeRange({ name }: DateTimeRangeProps) {
    const [userTimezone, setUserTimezone] = useState(timezones[0])
    const [localValue, setLocalValue] = useState<DateTimeRangeValue>(getDefaultDateTimeValue())
    const [utcTime, setUtcTime] = useState({
        start: new Date(),
        end: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    })

    useEffect(() => {
        // Function to find the matching timezone from the list
        const findMatchingTimezone = () => {
            const offset = new Date().getTimezoneOffset();
            const matchingTimezone = timezones.find(tz => tz.offset === offset);
            return matchingTimezone || timezones[12]; // Default to GMT if not found
        };

        const detectedTimezone = findMatchingTimezone();
        setUserTimezone(detectedTimezone)
    }, [])

    const updateValue = (field: 'start' | 'end', type: 'date' | 'time', newValue: string) => {
        const [currentDate, currentTime] = localValue[field].split('T')
        const updatedValue = type === 'date' ? `${newValue}T${currentTime}` : `${currentDate}T${newValue}`
        const updatedUtcTime = {
            ...utcTime,
            [field]: fromZonedTime(updatedValue, userTimezone.timeZone),
        }

        setLocalValue(prevValue => ({
                ...prevValue,
                [field]: updatedValue,
            }))
        setUtcTime(updatedUtcTime)
    }

    const formatDateTimeForInput = (isoString: string) => {
        const date = toZonedTime(fromZonedTime(isoString, userTimezone.timeZone), userTimezone.timeZone)  
        return {
            date: format(date, 'yyyy-MM-dd'),
            time: date.toTimeString().slice(0, 5)
        }
    }

    return (
        <div className="space-y-4">
            <input type='hidden' name={name} value={JSON.stringify(utcTime)} />
            <input type='hidden' name={`${name}_timezone`} value={JSON.stringify(userTimezone)} />
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Timezone</span>
                <Select value={userTimezone.timeZone} onValueChange={(value) => {
                    const prevTimezone = userTimezone
                    const selectedTimezone = timezones.find(tz => tz.timeZone === value)
                    if (selectedTimezone) {
                        const utcStart = fromZonedTime(localValue.start, prevTimezone.timeZone)
                        const utcEnd = fromZonedTime(localValue.end, prevTimezone.timeZone)

                        setUserTimezone(selectedTimezone)
                        setLocalValue(() => ({
                            start: toZonedTime(utcStart, selectedTimezone.timeZone).toISOString(),
                            end: toZonedTime(utcEnd, selectedTimezone.timeZone).toISOString(),
                        }))
                        setUtcTime({
                            start: utcStart,
                            end: utcEnd,
                        })
                    }
                }}>
                    <SelectTrigger className='w-[340px] text-xs flex justify-between items-center'>
                        <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map((tz) => (
                            <SelectItem 
                                key={tz.timeZone} 
                                value={tz.timeZone} 
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