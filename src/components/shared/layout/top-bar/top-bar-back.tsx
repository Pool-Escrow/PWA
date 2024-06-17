'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TopBarBack() {
	const { back } = useRouter()

	return (
		<Button onClick={back} variant='ghost' size='icon'>
			<ChevronLeftIcon className='size-6 text-[#1A70E0]' />
		</Button>
	)
}
