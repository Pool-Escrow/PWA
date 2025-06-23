export const formatTimeDiff = (diffInMs: number) => {
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    // console.log('diffInMs', diffInMs)

    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
}

export const formatEventDateTime = (startTime: number): string => {
    const currentTimestamp: Date = new Date()
    const startDateObject: Date = new Date(startTime * 1000)
    const timeLeft = startDateObject.getTime() - currentTimestamp.getTime()
    // console.log('currentTimeStamp', currentTimestamp.getTime())
    // console.log('startDateTimeStamp', startDateObject.getTime())

    // console.log('timeLeft', timeLeft)
    const { days } = formatTimeDiff(timeLeft)
    // console.log('days', days)

    const monthYear = startDateObject.toLocaleDateString([], {
        month: 'short',
        year: 'numeric',
    })
    const day = startDateObject.getDate()

    if (days === 0) {
        return `Today @ ${startDateObject.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })}`
    } else if (days === 1) {
        return `Tomorrow @ ${startDateObject.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })}`
    } else {
        return `${day} ${monthYear} ${startDateObject.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })}`
    }
}

export const formatCountdownTime = (timeLeft: number): string => {
    const timeLeftSeconds = timeLeft / 1000
    const dayInSeconds = 60 * 60 * 24
    const hourInSeconds = 60 * 60
    const minuteInSeconds = 60
    const { days, hours, minutes, seconds } = formatTimeDiff(timeLeft)

    if (timeLeftSeconds > dayInSeconds) {
        return `${days}d`
    } else if (timeLeftSeconds > hourInSeconds) {
        return `${hours}h ${minutes}min`
    } else if (timeLeftSeconds > minuteInSeconds) {
        return `${minutes}min`
    } else {
        return `${seconds}s`
    }
}
