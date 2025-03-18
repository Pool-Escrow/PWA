import { AlertCircle } from 'lucide-react'

interface ServiceUnavailableMessageProps {
    onRetry?: () => void
}

export const ServiceUnavailableMessage = ({ onRetry }: ServiceUnavailableMessageProps) => {
    return (
        <div className='flex flex-col items-center justify-center gap-4 py-8 text-center'>
            <AlertCircle className='size-8 text-yellow-500' />

            <div className='space-y-2'>
                <h3 className='font-semibold'>Service Temporarily Unavailable</h3>
                <p className='mx-auto max-w-[280px] text-sm text-gray-500'>
                    Our cross-chain swap service is temporarily paused for security enhancements.
                </p>
            </div>

            <div className='flex w-full max-w-[280px] flex-col gap-2'>
                <p className='text-sm font-medium text-gray-600'>Try these alternatives:</p>

                <a
                    href='https://www.debridge.finance/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'>
                    deBridge
                </a>

                <a
                    href='https://bungee.exchange/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100'>
                    Bungee
                </a>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className='mt-2 flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'>
                        Try again later
                    </button>
                )}
            </div>
        </div>
    )
}
