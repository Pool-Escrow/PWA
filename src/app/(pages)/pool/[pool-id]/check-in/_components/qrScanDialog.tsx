import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ScanDialogProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export function QrScanDialog({ isOpen, onClose, children }: ScanDialogProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='fixed inset-0 bg-black/50' onClick={onClose} />
            <div className='relative z-50 mx-4 flex aspect-[3/2] w-full max-w-xl flex-row items-start justify-center rounded-[28px] bg-white p-[10px] shadow-xl md:rounded-[42px] md:p-[12px]'>
                {children}
            </div>
        </div>,
        document.body,
    )
}
