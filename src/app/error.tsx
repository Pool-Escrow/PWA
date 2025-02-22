'use client'

import { ArrowLeft, Clipboard, Home, RefreshCw, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from './_components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const router = useRouter()
    const isProduction = process.env.NODE_ENV === 'production'

    useEffect(() => {
        // Log the error to an error reporting service here
        console.error(error)
    }, [error])

    const errorDetails = isProduction
        ? { digest: error.digest }
        : {
              message: error.message,
              stack: error.stack,
              digest: error.digest,
          }

    const parseErrorDetails = (details: typeof errorDetails) => {
        return JSON.stringify(details, null, 2).replace(/\\n/g, '\n').replace(/\\"/g, '"')
    }

    const copyErrorToClipboard = () => {
        void navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
        toast.success('Error details copied to clipboard')
    }

    const sendErrorReport = () => {
        const subject = encodeURIComponent('Error Report')
        const body = encodeURIComponent(`Error Details:\n\n${JSON.stringify(errorDetails, null, 2)}`)
        window.location.href = `mailto:dev@poolparty.cc?subject=${subject}&body=${body}`
        toast.success('Email client opened with error report')
    }

    const buttonConfig = [
        {
            text: 'Go Back',
            icon: ArrowLeft,
            action: () => router.back(),
        },
        {
            text: 'Try Again',
            icon: RefreshCw,
            action: reset,
        },
        {
            text: 'Send Report',
            icon: Send,
            action: sendErrorReport,
        },
        {
            text: 'Homepage',
            icon: Home,
            action: () => router.push('/'),
        },
    ]

    return (
        <div className='flex flex-1 flex-col items-center bg-gradient-to-b py-20'>
            <h1 className='text-2xl font-bold'>Oops! Something went wrong</h1>
            <p className='my-2 text-balance text-center text-[16px]'>
                We&apos;re sorry for the inconvenience. Our team has been notified.
            </p>

            {isProduction ? (
                <p className='my-10 text-sm text-gray-600'>Error ID: {error.digest}</p>
            ) : (
                <div className='relative mx-10 my-4 w-full max-w-2xl overflow-hidden rounded-lg bg-neutral-200 p-4'>
                    <Button
                        onClick={copyErrorToClipboard}
                        variant='outline'
                        size='icon'
                        className='absolute right-2 top-2 rounded-full border p-2'
                        aria-label='Copy error'
                        title='Copy error'>
                        <Clipboard className='size-4' />
                    </Button>
                    <pre className='h-full overflow-x-auto text-xs'>
                        <code>{parseErrorDetails(errorDetails)}</code>
                    </pre>
                </div>
            )}

            <div className='grid w-full max-w-xs grid-cols-2 gap-4'>
                {buttonConfig.map((button, index) => (
                    <Button
                        key={index}
                        onClick={button.action as () => void}
                        variant='outline'
                        className='rounded-[2rem] transition-transform active:scale-90'>
                        <button.icon className='mr-2 size-4' />
                        {button.text}
                    </Button>
                ))}
            </div>
        </div>
    )
}
