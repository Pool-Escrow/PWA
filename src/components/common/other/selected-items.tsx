'use client'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trash } from 'lucide-react'

interface OnRemoveItemCallback {
	(index: number): void
}

interface SelectedItemsProps {
	items: string[]
	onRemoveItem: OnRemoveItemCallback
}

export const SelectedItems = ({ items, onRemoveItem }: SelectedItemsProps) => {
	return (
		<div className='flex gap-2'>
			{items.map((item: string, i: number) => (
				<DropdownMenu key={i}>
					<DropdownMenuTrigger asChild>
						<span className='h-[38px] w-auto cursor-pointer content-center rounded-[70px] border border-[#ebebeb] px-6 text-sm font-normal leading-tight text-black backdrop-blur-[2px]'>
							{item}
						</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							className='text-red-600'
							onClick={() => onRemoveItem(i)}
						>
							<Trash className='mr-2 size-4' />
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			))}
		</div>
	)
}
