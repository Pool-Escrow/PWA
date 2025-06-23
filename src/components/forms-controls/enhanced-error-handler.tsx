'use client'

/**
 * Enhanced Error Handler Utility
 *
 * This utility helps parse and display more specific error messages
 * for form validation, providing better user experience.
 */

interface ErrorDisplayProps {
    errors: string[]
    fieldType: 'dateRange' | 'description' | 'general'
    className?: string
}

export function ErrorDisplay({ errors, fieldType, className = '' }: ErrorDisplayProps) {
    if (!errors || errors.length === 0) return null

    const getEnhancedMessage = (error: string, type: typeof fieldType) => {
        const errorLower = error.toLowerCase()

        switch (type) {
            case 'dateRange':
                if (errorLower.includes('start') || errorLower.includes('begin')) {
                    return { message: error, type: 'start' }
                } else if (errorLower.includes('end') || errorLower.includes('finish')) {
                    return { message: error, type: 'end' }
                } else if (errorLower.includes('city') || errorLower.includes('location')) {
                    return { message: error, type: 'city' }
                } else if (errorLower.includes('future')) {
                    return { message: 'Event must start in the future', type: 'start' }
                } else if (errorLower.includes('after')) {
                    return { message: 'End time must be after start time', type: 'end' }
                } else {
                    return { message: error, type: 'general' }
                }

            case 'description':
                if (errorLower.includes('required')) {
                    return { message: 'Please provide a description for your pool', type: 'required' }
                } else if (errorLower.includes('5 characters')) {
                    return { message: 'Description must be at least 5 characters long', type: 'minLength' }
                } else if (errorLower.includes('500 characters')) {
                    return { message: 'Description cannot exceed 500 characters', type: 'maxLength' }
                } else {
                    return { message: error, type: 'general' }
                }

            default:
                return { message: error, type: 'general' }
        }
    }

    const enhancedError = getEnhancedMessage(errors[0], fieldType)

    return (
        <p className={`mt-1 text-xs text-red-500 ${className}`} role='alert'>
            {enhancedError.message}
        </p>
    )
}

/**
 * Utility function to categorize dateRange errors for more specific display
 */
export function parseeDateRangeErrors(errors: string[]) {
    const categorized = {
        start: [] as string[],
        end: [] as string[],
        city: [] as string[],
        general: [] as string[],
    }

    errors.forEach(error => {
        const errorLower = error.toLowerCase()
        if (errorLower.includes('start') || errorLower.includes('begin')) {
            categorized.start.push(error)
        } else if (errorLower.includes('end') || errorLower.includes('finish')) {
            categorized.end.push(error)
        } else if (errorLower.includes('city') || errorLower.includes('location') || errorLower.includes('timezone')) {
            categorized.city.push(error)
        } else if (errorLower.includes('future')) {
            categorized.start.push('Event must start in the future')
        } else if (errorLower.includes('after')) {
            categorized.end.push('End time must be after start time')
        } else {
            categorized.general.push(error)
        }
    })

    return categorized
}

/**
 * HOC for form controls to handle error clearing on user input
 */
export function withErrorClearing<T extends object>(Component: React.ComponentType<T & { errors?: string[] }>) {
    return function WrappedComponent(props: T & { errors?: string[]; onErrorClear?: () => void }) {
        const { onErrorClear, ...rest } = props

        // Call error clearing when user starts interacting
        const handleInteraction = () => {
            if (props.errors && props.errors.length > 0) {
                onErrorClear?.()
            }
        }

        return (
            <div onFocus={handleInteraction} onClick={handleInteraction}>
                <Component {...(rest as T & { errors?: string[] })} />
            </div>
        )
    }
}
