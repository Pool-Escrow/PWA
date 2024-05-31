import { SearchDialog } from '@/components/search-dialog'
import { SelectedItems } from '@/components/selected-items'

export type MultiSelectValue = string[]

interface MultiSelectProps {
	value: MultiSelectValue
	setValue: React.Dispatch<React.SetStateAction<MultiSelectValue>>
}

export function MultiSelect({ value, setValue }: MultiSelectProps) {
	const pushValue = (item: string) => {
		setValue([...value, item])
	}

	const removeValue = (item: number) => {
		const newValue = value.filter((_, i) => i !== item)
		setValue(newValue)
	}

	const addItem = (item: string) => {
		// check if item is already selected
		if (value.includes(item)) {
			alert('item already selected')
			return
		}
		pushValue(item)
	}

	return (
		<div className='flex flex-row items-center gap-2 px-4 py-3'>
			<SearchDialog items={value} onAddItem={addItem} />
			<SelectedItems items={value} onRemoveItem={removeValue} />
		</div>
	)
}
