'use client'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Drawer } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import useMediaQuery from '@/lib/hooks/use-media-query'
import { cn } from '@/lib/utils/tailwind'
import shareIcon from '@/public/images/share_icon.svg'
import Image from 'next/image'
import router from 'next/router'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import Divider from '../other/divider'

const ShareDialog = () => {
	const [open, setOpen] = useState(false)
	const isDesktop = useMediaQuery('(min-width: 768px)')

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<Dialog.Trigger asChild>
					<button
						type='button'
						title='Share with Friends'
						className='rounded-full w-8 h-8  md:w-14 md:h-14 md:p-3 p-2 bg-black bg-opacity-40'
					>
						<Image
							className='w-full h-full flex'
							src={shareIcon.src}
							alt='Share with Friends'
						/>
					</button>
				</Dialog.Trigger>
				<Dialog.Content className='sm:max-w-[425px]'>
					<Dialog.Header>
						<Dialog.Title>Share with Friends</Dialog.Title>
						<Dialog.Description>
							Invites are best attended with friends. The more the merrier.
						</Dialog.Description>
					</Dialog.Header>
					<ShareForm />
				</Dialog.Content>
			</Dialog>
		)
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<Drawer.Trigger asChild>
				<button
					title='Share with Friends'
					type='button'
					className='rounded-full w-8 h-8  md:w-14 md:h-14 md:p-3 p-2 bg-black bg-opacity-40'
				>
					<Image
						className='w-full h-full flex'
						src={shareIcon.src}
						alt='Share with Friends'
					/>
				</button>
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header className='text-left'>
					<Drawer.Title>Share with Friends</Drawer.Title>
					<Drawer.Description>
						Invites are best attended with friends. The more the merrier.
					</Drawer.Description>
				</Drawer.Header>
				<ShareForm className='px-4' />
				<Drawer.Footer className='pt-2'>
					<Drawer.Close asChild>
						<Button variant='outline'>Cancel</Button>
					</Drawer.Close>
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer>
	)
}

function ShareForm({ className }: React.ComponentProps<'form'>) {
	const currentRoute = router.asPath
	const [, setCopied] = useState(false)
	const [pageUrl, setPageUrl] = useState('')

	useEffect(() => {
		setPageUrl(window?.location?.href)
	}, [])

	const copyToClipboard = async () => {
		console.log('copyToClipboard')

		try {
			await navigator.clipboard.writeText(pageUrl.replace('admin/', ''))
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
				{Object.keys(currentRoute).length !== 0 && (
					<QRCode
						size={256}
						style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
						value={pageUrl.replace('admin/', '')}
						viewBox={`0 0 256 256`}
					/>
				)}
			</div>
			<div className='flex flex-col space-y-2'>
				<Divider />
				<h4 className='text-sm'>Share the link:</h4>
				<div className='flex flex-col'>
					<div className='flex flex-row space-x-2'>
						<Input value={pageUrl.replace('admin/', '')} readOnly />
						<Button onClick={copyToClipboard}>Copy</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ShareDialog
