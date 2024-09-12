/**
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
 * source: https://www.builder.io/blog/relative-time
 */
import { toZonedTime } from "date-fns-tz"

export function getRelativeTimeString(date: Date | number, lang = navigator.language): string {
    // Allow dates or times to be passed
    const timeMs = date instanceof Date ? date.getTime() : typeof date === 'string' ? new Date(date).getTime() : date

    if (!Number.isFinite(timeMs)) {
        console.error('Invalid date provided:', date)
        return 'Invalid date'
    }

    // Get the amount of seconds between the given date and now
    const deltaSeconds = Math.round((timeMs - Date.now()) / 1000)

    // Array reprsenting one minute, hour, day, week, month, etc in seconds
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

    if (!Number.isFinite(deltaSeconds) || !Number.isFinite(divisor)) {
        return 'Invalid date'
        // throw new Error('deltaSeconds and divisor must be finite numbers');
    }

    return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex])
}

interface PoolBase {
    startDate: string | Date
    endDate: string | Date
}

export const getStatusString = ({
    status,
    startDate,
    endDate,
}: Pick<PoolBase, 'startDate' | 'endDate'> & { status: 'live' | 'upcoming' | 'past' }) => {
    const definitions = {
        upcoming: { verb: 'Starts', reference: startDate },
        past: { verb: 'Ended', reference: endDate },
        live: { verb: 'Ends', reference: endDate },
    }

    const { verb, reference } = definitions[status]

    try {
        const relativeTime = getRelativeTimeString(new Date(reference))
        // Ajusta el verbo para eventos pasados
        const adjustedVerb = status === 'past' ? 'Ended' : verb
        return `${adjustedVerb} ${relativeTime}`
    } catch (error) {
        console.error('Error parsing date:', error)
        return 'Date information unavailable'
    }
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
