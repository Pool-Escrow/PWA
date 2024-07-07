import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { baseSepolia } from 'viem/chains'
import { useAccount } from 'wagmi'

const OnRampCoinbaseButton = ({ className }: React.ComponentProps<'form'>) => {
    const account = useAccount()

    const handleOnRampByPaySDK = async ({ params }: { params: [string, string] }) => {
        const [chainName, address] = params

        let dataObj = { chainName, address }
        try {
            const response = await fetch('/api/on_ramp_coinbase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataObj),
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data = await response.json()
            return data
        } catch (error) {
            console.error('There was a problem with the post operation:', error)
        }
    }

    const onRampMutation = useMutation({
        mutationFn: handleOnRampByPaySDK,
        onSuccess: (data: any) => {
            // Perform actions on the returned data
            console.log('onramp url', data)
            window.open(data.onRampUrl, '_blank', 'noopener,noreferrer')
        },
        onError: () => {
            console.log('claimMutation Error')
        },
    })

    const onOnRampButtonClicked = () => {
        if (account?.address) {
            onRampMutation.mutate({
                params: [baseSepolia.name, account.address],
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
