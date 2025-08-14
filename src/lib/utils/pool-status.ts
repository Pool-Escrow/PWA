import { POOLSTATUS } from '@/types/pools'

/**
 * Get status string for a pool based on its status and dates
 */
export function getStatusString({
  status,
  startDate,
  endDate,
}: {
  status: POOLSTATUS
  startDate: Date | string
  endDate: Date | string
}): string {
  const now = new Date()

  // Ensure dates are Date objects
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)

  switch (status) {
    case POOLSTATUS.INACTIVE:
      return 'Pool not yet active'

    case POOLSTATUS.DEPOSIT_ENABLED: {
      const timeToStart = start.getTime() - now.getTime()
      if (timeToStart > 0) {
        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days > 0) {
          return `Starts in ${days} day${days > 1 ? 's' : ''}`
        }
        else if (hours > 0) {
          return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`
        }
        else {
          return 'Starting soon'
        }
      }
      return 'Registration open'
    }

    case POOLSTATUS.STARTED: {
      const timeToEnd = end.getTime() - now.getTime()
      if (timeToEnd > 0) {
        const days = Math.floor(timeToEnd / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days > 0) {
          return `Ends in ${days} day${days > 1 ? 's' : ''}`
        }
        else if (hours > 0) {
          return `Ends in ${hours} hour${hours > 1 ? 's' : ''}`
        }
        else {
          return 'Ending soon'
        }
      }
      return 'Pool live'
    }

    case POOLSTATUS.ENDED:
      return `Ended ${end.toLocaleDateString()}`

    case POOLSTATUS.DELETED:
      return 'Pool deleted'

    default:
      return 'Status unknown'
  }
}
