export async function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]) // Remove the data URL prefix
            } else {
                reject(new Error('Failed to convert file to base64'))
            }
        }
        reader.onerror = error =>
            reject(new Error(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`))
    })
}

export async function convertFromBase64(base64String: string, fileName: string, mimeType: string): Promise<File> {
    return new Promise((resolve, reject) => {
        try {
            const binaryString = atob(base64String)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            const blob = new Blob([bytes], { type: mimeType })
            resolve(new File([blob], fileName, { type: mimeType }))
        } catch (error) {
            reject(
                new Error(
                    `Error converting base64 to file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                ),
            )
        }
    })
}
