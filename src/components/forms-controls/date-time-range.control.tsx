'use client'

import { ComboboxCities } from '@/components/combobox-cities'
import type { Location } from '@/lib/utils/location-timezone'
import locationTimezone from '@/lib/utils/location-timezone'
import { addHours, format, parseISO } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { useCallback, useEffect, useState } from 'react'
import { Input } from '../ui/input'

export type DateTimeRangeValue = {
    start: string
    end: string
}

interface DateTimeRangeProps {
    name: string
    onChange?: (value: { start: Date; end: Date }) => void
    errors?: string[]
}

export default function DateTimeRange({ name, onChange, errors = [] }: DateTimeRangeProps) {
    const [selectedCity, setSelectedCity] = useState('')
    const [timezone, setTimezone] = useState('')
    const [localValue, setLocalValue] = useState<DateTimeRangeValue>({ start: '', end: '' })
    const [utcTime, setUtcTime] = useState<DateTimeRangeValue>({ start: '', end: '' })

    // Parse error messages to provide more specific feedback
    const getSpecificErrors = () => {
        const specificErrors = {
            start: [] as string[],
            end: [] as string[],
            city: [] as string[],
            general: [] as string[],
        }

        errors.forEach(error => {
            const errorLower = error.toLowerCase()
            if (errorLower.includes('start') || errorLower.includes('begin')) {
                specificErrors.start.push(error)
            } else if (errorLower.includes('end') || errorLower.includes('finish')) {
                specificErrors.end.push(error)
            } else if (
                errorLower.includes('city') ||
                errorLower.includes('location') ||
                errorLower.includes('timezone')
            ) {
                specificErrors.city.push(error)
            } else if (errorLower.includes('future')) {
                specificErrors.start.push('Event must start in the future')
            } else if (errorLower.includes('after')) {
                specificErrors.end.push('End time must be after start time')
            } else {
                specificErrors.general.push(error)
            }
        })

        return specificErrors
    }

    const specificErrors = getSpecificErrors()

    const updateTimezone = useCallback(
        (city: string, newTimezone: string) => {
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

            onChange?.({ start: now, end: oneHourLater })
        },
        [onChange],
    )

    const handleCityChange = useCallback(
        (city: string, countryCode: string, newTimezone: string) => {
            setSelectedCity(`${city}-${countryCode}`)
            updateTimezone(city, newTimezone)
        },
        [updateTimezone],
    )

    useEffect(() => {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const [_continent, cityName] = userTimezone.split('/')
        const locations = locationTimezone.findLocationsByCountryName(cityName, true)
        const defaultCity = locations.find((loc: Location) => loc.timezone === userTimezone)
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

        onChange?.({ start: now, end: oneHourLater })
    }, [handleCityChange, onChange])

    const updateValue = useCallback(
        (field: 'start' | 'end', type: 'date' | 'time', newValue: string) => {
            const updatedDate = toZonedTime(localValue[field], timezone)

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

            const utcDate = new Date(updatedISOString)
            setUtcTime(prevValue => ({
                ...prevValue,
                [field]: utcDate.toISOString(),
            }))

            const other = field === 'start' ? utcTime.end : utcTime.start
            const startDate = field === 'start' ? utcDate : new Date(other)
            const endDate = field === 'end' ? utcDate : new Date(other)
            onChange?.({ start: startDate, end: endDate })
        },
        [localValue, timezone, utcTime, onChange],
    )

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
            <input type='hidden' name='city' value={selectedCity} />

            {/* City Selection */}
            <div className='flex flex-row items-center justify-between'>
                <span className='mr-6 text-xs font-medium text-black'>City</span>
                <div className='flex flex-col items-end'>
                    <ComboboxCities value={selectedCity} onChangeId='cityChange' onCityChange={handleCityChange} />
                    {specificErrors.city.length > 0 && (
                        <p className='mt-1 text-xs text-red-500' role='alert'>
                            {specificErrors.city[0]}
                        </p>
                    )}
                </div>
            </div>

            {/* Start Date/Time */}
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Starts</span>
                <div className='flex flex-col items-end'>
                    <div className='inline-flex flex-row flex-nowrap gap-1'>
                        <div className='relative'>
                            <Input
                                className={`min-w-[130px] cursor-pointer bg-transparent px-3 text-center text-xs font-medium sm:min-w-[140px] ${
                                    specificErrors.start.length > 0 ? 'border-red-500' : ''
                                }`}
                                type='date'
                                value={formatDateTimeForInput(localValue.start).date}
                                onChange={e => updateValue('start', 'date', e.target.value)}
                                autoComplete='off'
                                prefix='date'
                                aria-invalid={specificErrors.start.length > 0}
                            />
                        </div>
                        <div className='relative'>
                            <Input
                                className={`min-w-[90px] cursor-pointer bg-white text-center text-xs font-medium sm:min-w-[100px] ${
                                    specificErrors.start.length > 0 ? 'border-red-500' : ''
                                }`}
                                type='time'
                                value={formatDateTimeForInput(localValue.start).time}
                                onChange={e => updateValue('start', 'time', e.target.value)}
                                autoComplete='off'
                                step={60}
                                aria-invalid={specificErrors.start.length > 0}
                            />
                        </div>
                    </div>
                    {specificErrors.start.length > 0 && (
                        <p className='mt-1 text-xs text-red-500' role='alert'>
                            {specificErrors.start[0]}
                        </p>
                    )}
                </div>
            </div>

            {/* End Date/Time */}
            <div className='flex flex-row items-center justify-between'>
                <span className='text-xs font-medium text-black'>Ends</span>
                <div className='flex flex-col items-end'>
                    <div className='inline-flex flex-row flex-nowrap gap-1'>
                        <div className='relative'>
                            <Input
                                className={`min-w-[130px] cursor-pointer bg-transparent px-3 text-center text-xs font-medium sm:min-w-[140px] ${
                                    specificErrors.end.length > 0 ? 'border-red-500' : ''
                                }`}
                                type='date'
                                value={formatDateTimeForInput(localValue.end).date}
                                onChange={e => updateValue('end', 'date', e.target.value)}
                                autoComplete='off'
                                prefix='date'
                                aria-invalid={specificErrors.end.length > 0}
                            />
                        </div>
                        <div className='relative'>
                            <Input
                                className={`min-w-[90px] cursor-pointer bg-white text-center text-xs font-medium sm:min-w-[100px] ${
                                    specificErrors.end.length > 0 ? 'border-red-500' : ''
                                }`}
                                type='time'
                                value={formatDateTimeForInput(localValue.end).time}
                                onChange={e => updateValue('end', 'time', e.target.value)}
                                autoComplete='off'
                                step={60}
                                aria-invalid={specificErrors.end.length > 0}
                            />
                        </div>
                    </div>
                    {specificErrors.end.length > 0 && (
                        <p className='mt-1 text-xs text-red-500' role='alert'>
                            {specificErrors.end[0]}
                        </p>
                    )}
                </div>
            </div>

            {/* General dateRange errors that don't fall into specific categories */}
            {specificErrors.general.length > 0 && (
                <p className='text-xs text-red-500' role='alert'>
                    {specificErrors.general[0]}
                </p>
            )}
        </div>
    )
}
