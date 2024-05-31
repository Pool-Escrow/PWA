'use client'

import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'

const sampleItems = [
	'SuperMoon',
	'Pepe',
	'Nouns',
	'Aleo',
	'Ethereum Foundation',
	'Uniswap',
	'Chainlink',
	'Aave',
	'Compound',
]

interface OnAddItemCallback {
	(item: string): void
}

interface SearchDialogProps {
	items: string[]
	onAddItem: OnAddItemCallback
}

export function SearchDialog({ items, onAddItem }: SearchDialogProps) {
	const [open, setOpen] = useState(false)

	const handleSelect = (item: string) => {
		setOpen(false)
		onAddItem(item)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					size='sm'
					className='h-[38px] w-auto content-center rounded-[70px] border border-[#ebebeb] px-4 text-sm font-normal leading-tight text-black backdrop-blur-[2px]'
				>
					<Plus />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Add a Co-host</DialogTitle>
				<Command>
					<CommandInput placeholder='Enter a username...' autoFocus={true} />
					<CommandList>
						<CommandEmpty>No users found with that name</CommandEmpty>
						<CommandGroup>
							{sampleItems
								.toSorted()
								.filter((item) => !items.includes(item))
								.map((item) => (
									<CommandItem key={item} value={item} onSelect={handleSelect}>
										{item}
									</CommandItem>
								))}
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	)
}
