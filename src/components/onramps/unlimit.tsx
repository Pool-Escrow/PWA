import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { GateFiSDK, GateFiDisplayModeEnum } from '@gatefi/js-sdk'
import { useEffect, useRef, useState } from 'react'

interface UnlimitProps {
    email?: string
    amount?: string
    purchaseCurrency?: string
    className?: string
    children?: React.ReactNode
    setOpen?: (open: boolean) => void
}

export default function Unlimit(props: UnlimitProps) {
    const { email, amount, purchaseCurrency, className, children, setOpen } = props
    const [isOverlayVisible, setIsOverlayVisible] = useState(false)
    let overlayInstance = useRef<GateFiSDK | null>(null)
    const account = useAccount()

    useEffect(() => {
        const handleClickOutside = () => {
            if (isOverlayVisible) {
                overlayInstance.current?.destroy()
                setIsOverlayVisible(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOverlayVisible])

    const onClick = () => {
        if (overlayInstance.current) {
            overlayInstance.current?.destroy()
            if (!isOverlayVisible) {
                setOpen && setOpen(false)
                overlayInstance.current?.show()
                setIsOverlayVisible(true)
            }
        } else {
            overlayInstance.current = new GateFiSDK({
                merchantId: process.env.NEXT_PUBLIC_UNLIMIT_MERCHANT_ID || '',
                displayMode: GateFiDisplayModeEnum.Overlay,
                nodeSelector: '#overlay-button',
                isSandbox: true, // ATTN: To change to false in production
                walletAddress: account.address,
                email,
                defaultFiat: {
                    currency: 'EUR',
                },
                defaultCrypto: {
                    currency: purchaseCurrency || '',
                    amount: amount || '0',
                },
            })
            setOpen && setOpen(false)
            overlayInstance.current?.show()
            setIsOverlayVisible(true)
        }
    }

    return (
        <>
            <Button id='overlay-button' className={className} onClick={onClick}>
                {children}
            </Button>
        </>
    )
}
