/**
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
 * source: https://www.builder.io/blog/relative-time
 */
export function getRelativeTimeString(date: Date | number, lang = navigator.language): string {
    // Allow dates or times to be passed
    const timeMs = date instanceof Date ? date.getTime() : date

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

export const getStatusString = ({
    status,
    startDate,
    endDate,
}: Pick<PoolFrontend, 'startDate' | 'endDate'> & { status: 'live' | 'upcoming' | 'past' }) => {
    const definitions = {
        upcoming: { verb: 'Starts', reference: startDate },
        past: { verb: 'Ended', reference: endDate },
        live: { verb: 'Ends', reference: endDate },
    }

    const { verb, reference } = definitions[status]
    const relativeTime = getRelativeTimeString(reference)

    return `${verb} ${relativeTime}`
}
