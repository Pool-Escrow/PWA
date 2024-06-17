import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSmartAccount } from '@/lib/hooks/use-smart-account'

export default function TopBarButton() {
	const { login, error, loading } = useSmartAccount()

	if (error) {
		return <div>{error}</div>
	}

	if (loading) {
		return (
			<Skeleton className='bg-[#36a0f7]/50 rounded-mini w-[46px] h-[30px] px-[10px] py-[5px] text-[10px]' />
		)
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
