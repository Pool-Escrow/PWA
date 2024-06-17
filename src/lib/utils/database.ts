interface Dictionary {
	[key: number]: string
}
export function dictionaryToArray(dictionary: Dictionary): string[] {
	if (dictionary == null) {
		return []
	}
	return Object.keys(dictionary).map((key) =>
		dictionary[parseInt(key)].toLowerCase(),
	)
}

export function dictionaryToNestedArray(dictionary: any): any[][] | null {
	if (dictionary == null) {
		return null
	}
	return Object.keys(dictionary).map((key) => dictionary[parseInt(key)])
}
export function getAllIndicesMatching(arr: any, value: any) {
	return arr?.reduce((indices: any, element: any, index: any) => {
		if (element === value) {
			indices.push(index)
		}
		return indices
	}, [])
}

export function getRowIndicesByColumnValue(
	arr2D: any,
	columnIndex: any,
	value: any,
) {
	const rowIndices: any[] = []
	arr2D.forEach((row: any, rowIndex: any) => {
		if (row[columnIndex] === value) {
			rowIndices.push(rowIndex)
		}
	})
	return rowIndices
}

export function getRowsByColumnValue(arr2D: any, columnIndex: any, value: any) {
	return arr2D?.filter((row: any) => row[columnIndex] === value)
}

export function getValuesFromIndices(arr: any, indices: any) {
	return indices?.map((index: any) => arr[index])
}
