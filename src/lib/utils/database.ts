interface Dictionary {
    [key: number]: string
}
export function dictionaryToArray(dictionary: Dictionary): string[] {
    if (dictionary == null) {
        return []
    }
    return Object.keys(dictionary).map(key => dictionary[parseInt(key)].toLowerCase())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dictionaryToNestedArray(dictionary: any): any[][] | null {
    if (dictionary == null) {
        return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return Object.keys(dictionary).map(key => dictionary[parseInt(key)])
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllIndicesMatching(arr: any, value: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return arr?.reduce((indices: any, element: any, index: any) => {
        if (element === value) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            indices.push(index)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return indices
    }, [])
}

export function getRowIndicesByColumnValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arr2D: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columnIndex: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowIndices: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    arr2D.forEach((row: any, rowIndex: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (row[columnIndex] === value) {
            rowIndices.push(rowIndex)
        }
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return rowIndices
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRowsByColumnValue(arr2D: any, columnIndex: any, value: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return arr2D?.filter((row: any) => row[columnIndex] === value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValuesFromIndices(arr: any, indices: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return indices?.map((index: any) => arr[index])
}
