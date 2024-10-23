import { Button } from '@/app/_components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { baseSepolia, base } from 'viem/chains'
import { useAccount } from 'wagmi'
import { inProduction } from '@/app/_lib/utils/environment.mjs'

const OnRampCoinbaseButton = ({ className }: React.ComponentProps<'form'>) => {
    const account = useAccount()

    const handleOnRampByPaySDK = async ({ params }: { params: [string, string] }) => {
        const [chainName, address] = params

        const dataObj = { chainName, address }
        try {
            const response = await fetch('/api/onramp-coinbase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataObj),
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            // eslint-disable-next-line
            const data = await response.json()
            // eslint-disable-next-line
            return data
        } catch (error) {
            console.error('There was a problem with the post operation:', error)
        }
    }

    const onRampMutation = useMutation({
        mutationFn: handleOnRampByPaySDK,
        // eslint-disable-next-line
        onSuccess: (data: any) => {
            // Perform actions on the returned data
            console.log('onramp url', data)
            // eslint-disable-next-line
            window.open(data.onRampUrl, '_blank', 'noopener,noreferrer')
        },
        onError: () => {
            console.log('claimMutation Error')
        },
    })

    const onOnRampButtonClicked = () => {
        if (account?.address) {
            let chainName = inProduction ? base.name : baseSepolia.name
            onRampMutation.mutate({
                params: [chainName, account.address],
            })
        }
    }

    return (
        <Button className={className} onClick={onOnRampButtonClicked}>
            On Ramp
        </Button>
    )
}

export default OnRampCoinbaseButton
