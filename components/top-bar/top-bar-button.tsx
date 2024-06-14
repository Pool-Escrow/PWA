import { Button } from '@/components/ui/button'
import { useSmartAccount } from '@/hooks/use-smart-account'

export function TopBarButton() {
	const { login, error, loading } = useSmartAccount()

	if (error) {
		return <div>{error}</div>
	}

	if (loading) {
		return <div>Loading...</div>
	}

	return (
		<Button
			className='bg-cta rounded-mini w-[46px] h-[30px] px-[10px] py-[5px] text-[10px]'
			onClick={login}
		>
			Login
		</Button>
	)
}
