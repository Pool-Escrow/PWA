'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '../ui/input'
import { format, addHours } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import locationTimezone from 'node-location-timezone'
import { ComboboxCities } from '@/components/combobox-cities'
import { parseISO } from 'date-fns'

export type DateTimeRangeValue = {
    start: string
    end: string
}

interface DateTimeRangeProps {
    name: string,
    required?: boolean
}

export default function DateTimeRange({ name, required }: DateTimeRangeProps) {
    const [selectedCity, setSelectedCity] = useState('')
    const [timezone, setTimezone] = useState('')
    const [localValue, setLocalValue] = useState<DateTimeRangeValue>({ start: '', end: '' })
    const [, setUtcTime] = useState<DateTimeRangeValue>({ start: '', end: '' })

    useEffect(() => {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const [continent, cityName] = userTimezone.split('/')
        const locations = locationTimezone.findLocationsByCountryName(cityName, true)
        const defaultCity = locations.find(loc => loc.timezone === userTimezone)
        if (defaultCity) {
            const cityValue = `${defaultCity.city}-${defaultCity.country.iso2}`
            setSelectedCity(cityValue)
            setTimezone(userTimezone)
            handleCityChange(defaultCity.city, defaultCity.country.iso2, userTimezone)
        }

        const now = new Date()
        const oneHourLater = addHours(now, 1)

        const initialLocalValue = {
            start: formatInTimeZone(now, userTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
            end: formatInTimeZone(oneHourLater, userTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        }

        setLocalValue(initialLocalValue)
        setUtcTime({
            start: now.toISOString(),
            end: oneHourLater.toISOString(),
        })
    }, [])

    const handleCityChange = useCallback((city: string, countryCode: string, newTimezone: string) => {
        setSelectedCity(`${city}-${countryCode}`)
        updateTimezone(city, newTimezone)
    }, [])

    const updateTimezone = (city: string, newTimezone: string) => {
        if (!newTimezone) {
            console.error(`Invalid timezone for city: ${city}`)
            return
        }
        setTimezone(newTimezone)

        const now = new Date()
        const zonedNow = toZonedTime(now, newTimezone)
        const oneHourLater = addHours(zonedNow, 1)

        const updatedLocalValue = {
            start: formatInTimeZone(zonedNow, newTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
            end: formatInTimeZone(oneHourLater, newTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        }

        setLocalValue(updatedLocalValue)
        setUtcTime({
            start: now.toISOString(),
            end: oneHourLater.toISOString(),
        })
    }

    const updateValue = (field: 'start' | 'end', type: 'date' | 'time', newValue: string) => {
        let updatedDate = toZonedTime(localValue[field], timezone)

        if (type === 'date') {
            const [year, month, day] = newValue.split('-').map(Number)
            updatedDate.setFullYear(year)
            updatedDate.setMonth(month - 1)
            updatedDate.setDate(day)
        } else {
            const [hours, minutes] = newValue.split(':').map(Number)
            updatedDate.setHours(hours)
            updatedDate.setMinutes(minutes)
        }

        const updatedISOString = formatInTimeZone(updatedDate, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")

        setLocalValue(prevValue => ({
            ...prevValue,
            [field]: updatedISOString,
        }))

        setUtcTime(prevValue => ({
            ...prevValue,
            [field]: new Date(updatedISOString).toISOString(),
        }))
    }

    const formatDateTimeForInput = (isoString: string) => {
        if (!isoString) {
            return { date: '', time: '' }
        }
        try {
            const date = parseISO(isoString)
            return {
                date: format(date, 'yyyy-MM-dd'),
                time: format(date, 'HH:mm'),
            }
        } catch (error) {
            console.error('Error parsing date:', error)
            return { date: '', time: '' }
        }
    }

    return (
        <div className='space-y-4'>
            <input type='hidden' name={name} value={JSON.stringify(localValue)} />
            <input type='hidden' name={`${name}_timezone`} value={timezone} />
            <div className='flex flex-row items-center justify-between'>
                <span className='mr-6 text-xs font-medium text-black'>City</span>
                <ComboboxCities value={selectedCity} onChangeId='cityChange' onCityChange={handleCityChange} />
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
                            required={required}
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
                            required={required}
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
