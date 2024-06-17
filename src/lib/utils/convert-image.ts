export function convertAndResizeToBase64(file: File): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)

		reader.onload = () => {
			const img = new Image()
			img.onload = () => {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')

				if (!ctx) {
					reject(new Error('Canvas context is not available'))
					return
				}

				const targetSize = 240
				canvas.width = targetSize
				canvas.height = targetSize

				// Calculate the scale to fit the image into the target size
				const scale = Math.min(targetSize / img.width, targetSize / img.height)
				const x = (targetSize - img.width * scale) / 2
				const y = (targetSize - img.height * scale) / 2

				ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

				resolve(canvas.toDataURL('image/png'))
			}

			img.onerror = () => reject(new Error('Image loading error'))
			img.src = reader.result as string
		}

		reader.onerror = () => reject(new Error('File reading error'))
	})
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
