import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface Dictionary {
	[key: number]: string
}

export const formatTimeDiff = (diffInMs: number) => {
	const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
	// console.log('diffInMs', diffInMs)

	const hours = Math.floor(
		(diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	)
	const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000)

	return { days, hours, minutes, seconds }
}

export const formatEventDateTime = (startTime: number): string => {
	const currentTimestamp: Date = new Date()
	const startDateObject: Date = new Date(startTime * 1000)
	const timeLeft = startDateObject.getTime() - currentTimestamp.getTime()
	console.log('currentTimeStamp', currentTimestamp.getTime())
	console.log('startDateTimeStamp', startDateObject.getTime())

	console.log('timeLeft', timeLeft)
	const { days } = formatTimeDiff(timeLeft)
	console.log('days', days)

	const monthYear = startDateObject.toLocaleDateString([], {
		month: 'short',
		year: 'numeric',
	})
	const day = startDateObject.getDate()

	if (days === 0) {
		return `Today @ ${startDateObject.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		})}`
	} else if (days === 1) {
		return `Tomorrow @ ${startDateObject.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		})}`
	} else {
		return `${day} ${monthYear} ${startDateObject.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		})}`
	}
}

export const formatCountdownTime = (timeLeft: number): string => {
	const timeLeftSeconds = timeLeft / 1000
	const dayInSeconds = 60 * 60 * 24
	const hourInSeconds = 60 * 60
	const minuteInSeconds = 60
	const { days, hours, minutes, seconds } = formatTimeDiff(timeLeft)

	if (timeLeftSeconds > dayInSeconds) {
		return `${days}d`
	} else if (timeLeftSeconds > hourInSeconds) {
		return `${hours}h ${minutes}min`
	} else if (timeLeftSeconds > minuteInSeconds) {
		return `${minutes}min`
	} else {
		return `${seconds}s`
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
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

export function formatAddress(address: string) {
	return `${address?.slice(0, 6)}...${address?.slice(-4)}`
}

export function convertToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader()
		fileReader.readAsDataURL(file)
		fileReader.onload = () => {
			if (typeof fileReader.result === 'string') {
				resolve(fileReader.result)
			} else {
				reject('Error converting file to base64')
			}
		}
		fileReader.onerror = (error) => {
			reject(error)
		}
	})
}
