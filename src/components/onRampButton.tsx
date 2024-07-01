import { Button } from '@/components/ui/button'
import { useCookie } from '@/hooks/use-cookie'
import { handleOnRampByPaySDK } from '@/lib/api/clientAPI'
import { useMutation } from '@tanstack/react-query'
import { baseSepolia } from 'viem/chains'

const OnRampButton = ({ className }: React.ComponentProps<'form'>) => {
    const { currentJwt } = useCookie()

    const onRampMutation = useMutation({
        mutationFn: handleOnRampByPaySDK,
        onSuccess: (data: any) => {
            // Perform actions on the returned data
            console.log('onramp url', data)
            window.open(data.onRampUrl, '_blank')
        },
        onError: () => {
            console.log('claimMutation Error')
        },
    })

    const onOnRampButtonClicked = () => {
        onRampMutation.mutate({
            params: [baseSepolia.name, currentJwt!],
        })
    }

    return (
        <Button className={className} onClick={onOnRampButtonClicked}>
            On Ramp
        </Button>
    )
}

export default OnRampButton
