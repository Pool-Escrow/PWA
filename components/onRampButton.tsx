import { useMutation } from '@tanstack/react-query'
import { Button } from './ui/button'
import { handleOnRampByPaySDK } from '@/lib/api/clientAPI'
import { baseSepolia, base, mainnet } from 'viem/chains'
import { useCookie } from '@/hooks/cookie'

const OnRampButton = () => {
	const { currentJwt } = useCookie()

	const onRampMutation = useMutation({
		mutationFn: handleOnRampByPaySDK,
		onSuccess: (data) => {
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

	return <Button onClick={onOnRampButtonClicked}>On Ramp</Button>
}

export default OnRampButton
