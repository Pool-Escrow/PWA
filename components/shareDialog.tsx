import * as React from 'react'

import { cn } from '@/lib/utils'
import useMediaQuery from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import shareIcon from '@/public/images/share_icon.svg'
import QRCode from 'react-qr-code'
import * as _ from 'lodash'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dispatch, SetStateAction, useState } from 'react'
import router from 'next/router'
import Divider from './divider'
import { toast } from './ui/use-toast'

interface shareDialogProps {
	open?: boolean
	setOpen?: Dispatch<SetStateAction<boolean>>
}
const ShareDialog = (props: shareDialogProps) => {
	const [open, setOpen] = React.useState(false)
	const isDesktop = useMediaQuery('(min-width: 768px)')
	const poolId = router.query.poolId

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<button className='rounded-full w-8 h-8  md:w-14 md:h-14 md:p-3 p-2 bg-black bg-opacity-40'>
						<img className='w-full h-full flex' src={shareIcon.src} />
					</button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Share with Friends</DialogTitle>
						<DialogDescription>
							Invites are best attended with friends. The more the merrier.
						</DialogDescription>
					</DialogHeader>
					<ShareForm />
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<button className='rounded-full w-8 h-8  md:w-14 md:h-14 md:p-3 p-2 bg-black bg-opacity-40'>
					<img className='w-full h-full flex' src={shareIcon.src} />
				</button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className='text-left'>
					<DrawerTitle>Share with Friends</DrawerTitle>
					<DrawerDescription>
						Invites are best attended with friends. The more the merrier.
					</DrawerDescription>
				</DrawerHeader>
				<ShareForm className='px-4' />
				<DrawerFooter className='pt-2'>
					<DrawerClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}

function ShareForm({ className }: React.ComponentProps<'form'>) {
	const currentRoute = router.asPath
	const [copied, setCopied] = useState(false)

	const copyToClipboard = async () => {
		console.log('copyToClipboard')

		try {
			await navigator.clipboard.writeText(window.location.href)
			toast({
				title: 'Share Link',
				description: 'Copied link to clipboard!',
			})
			setCopied(true)
		} catch (error) {
			console.error('Failed to copy:', error)
			toast({
				title: 'Share Link',
				description: 'Failed to copy link to clipboard!',
			})
		}
	}
	return (
		<div className={cn('flex flex-col space-y-10 my-8', className)}>
			<div className='w-full h-60 flex flex-col justify-center items-center'>
				{!_.isEmpty(currentRoute) && (
					<QRCode
						size={256}
						style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
						value={window.location.href}
						viewBox={`0 0 256 256`}
					/>
				)}
			</div>
			<div className='flex flex-col space-y-2'>
				<Divider />
				<h4 className='text-sm'>Share the link:</h4>
				<div className='flex flex-col'>
					<div className='flex flex-row space-x-2'>
						<Input value={window.location.href} readOnly />
						<Button onClick={copyToClipboard}>Copy</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ShareDialog
