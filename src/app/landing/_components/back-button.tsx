'use client'

const BackButton = ({ children }: React.PropsWithChildren) => {
    return (
        <button
            type='button'
            onClick={() => window.history.back()}
            className='text-primary underline-offset-4 hover:underline'>
            {children}
        </button>
    )
}

export default BackButton
