import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { GateFiSDK, GateFiDisplayModeEnum } from '@gatefi/js-sdk'
import { useEffect, useRef, useState } from 'react'

export default function Unlimit(props: {
		email: string; 
		amount: string; 
		purchaseCurrency: string; 
	}) {
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
    }, [overlayInstance, isOverlayVisible]);

    const onClick = () => {
        if (overlayInstance.current) {
            if (!isOverlayVisible) {
                overlayInstance.current?.show();
                setIsOverlayVisible(true);
            }
        } else {
            overlayInstance.current = new GateFiSDK({
                merchantId: process.env.UNLIMIT_MERCHANT_ID || 'f41fc715-613e-4262-9ab0-456fbe25b583',
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