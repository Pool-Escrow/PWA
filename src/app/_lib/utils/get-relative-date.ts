/**
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
 * source: https://www.builder.io/blog/relative-time
 */
import { toZonedTime } from 'date-fns-tz'
import {POOLSTATUS} from '@/app/(pages)/pool/[pool-id]/_lib/definitions';

export function getRelativeTimeString(date: Date | number | string, lang = navigator.language): string {
    // Check if the input is valid
    if (date === null || date === undefined || date === '') {
        return 'Date not available'
    }

    // Allow dates or times to be passed
    const timeMs = date instanceof Date ? date.getTime() : typeof date === 'string' ? new Date(date).getTime() : date

    if (!Number.isFinite(timeMs) || isNaN(timeMs)) {
        console.warn('Invalid date provided:', date)
        return 'Invalid date'
    }

    // Get the amount of seconds between the given date and now
    const deltaSeconds = Math.round((timeMs - Date.now()) / 1000)

    // Array representing one minute, hour, day, week, month, etc in seconds
    const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity]

    // Array equivalent to the above but in the string representation of the units
    const units: Intl.RelativeTimeFormatUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']

    // Grab the ideal cutoff unit
    const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds))

    // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
    // is one day in seconds, so we can divide our seconds by this to get the # of days
    const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1

    // Intl.RelativeTimeFormat do its magic
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })

    return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex])
}

interface PoolBase {
    startDate: Date
    endDate: Date
}

type PoolStatusDefinition = {
    verb: string;
    reference: Date;
};

export function getPrettyDate(poolDate: Date) {
    const date = new Date(poolDate);
    const day = String(date.getDate()).padStart(2, '0'); // Ensures two-digit day
    const month = date.toLocaleString('en-GB', { month: 'long' }); // Gets full month name
    const year = date.getFullYear();

    return`${day} ${month} ${year}`;
}

export const getStatusString = ({
    status,
    startDate,
    endDate,
}: Pick<PoolBase, 'startDate' | 'endDate'> & { status: POOLSTATUS }): string => {
    const definitions: Partial<Record<POOLSTATUS, PoolStatusDefinition>>   = {
        [POOLSTATUS.INACTIVE]: { verb: 'Starts', reference: startDate },
        [POOLSTATUS.DEPOSIT_ENABLED]: { verb: 'Starts', reference: startDate },
        [POOLSTATUS.ENDED]: { verb: 'Ended', reference: endDate },
        [POOLSTATUS.STARTED]: { verb: 'Ends', reference: endDate },
    }

    if (!(status in definitions)) {
        return 'Date information unavailable'
    }
    const definition = definitions[status] as PoolStatusDefinition

    const time = getPrettyDate(definition.reference)
    const adjustedVerb = definition.verb

    return `${adjustedVerb} ${time}`
}

export const getFormattedEventTime = (startDate: Date | string, endDate: Date | string): string => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = toZonedTime(new Date(), userTimeZone)
    const start = toZonedTime(new Date(startDate), userTimeZone)
    const end = toZonedTime(new Date(endDate), userTimeZone)

    if (now > end) {
        return 'Ended'
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    if (start.toDateString() === now.toDateString()) {
        return `Today at ${formatTime(start)}`
    }

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (start.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${formatTime(start)}`
    }

    return (
        start.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ` at ${formatTime(start)}`
    )
}
