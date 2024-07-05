import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { GateFiSDK, GateFiDisplayModeEnum } from '@gatefi/js-sdk'
import { useEffect, useRef, useState } from 'react'

type fn = () => void

interface UnlimitProps {
    email: string
    amount: string
    purchaseCurrency: string
}

export default function Unlimit(props: UnlimitProps) {
	const { email, amount, purchaseCurrency } = props;
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    let overlayInstance = useRef<GateFiSDK | null>(null);
    const account = useAccount();

	useEffect(() => {
        const handleClickOutside = () => {
            if (isOverlayVisible) {
                overlayInstance.current?.hide();
                setIsOverlayVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOverlayVisible]);

    const onClick = () => {
        if (overlayInstance.current) {
            if (!isOverlayVisible) {
                overlayInstance.current?.show();
                setIsOverlayVisible(true);
            }
        } else {
            overlayInstance.current = new GateFiSDK({
                merchantId: process.env.NEXT_PUBLIC_UNLIMIT_MERCHANT_ID || '',
                displayMode: GateFiDisplayModeEnum.Overlay,
                nodeSelector: "#overlay-button",
                isSandbox: true,	// ATTN: To change to false in production
                walletAddress: account.address,
                email,
                defaultFiat: {
                  currency: "EUR",
                  amount,
                },
                defaultCrypto: {
                  currency: purchaseCurrency,
                },
            });

			overlayInstance.current.show();
			setIsOverlayVisible(true);
        }
    }

    return (
		<>
			<Button className='h-[30px] w-[46px] rounded-mini bg-cta px-[10px] py-[5px] text-[10px]' onClick={onClick}>
				Unlimit
			</Button>
			<div id="overlay-button"></div>
		</>       
    )
}