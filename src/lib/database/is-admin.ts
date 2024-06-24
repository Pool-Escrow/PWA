export const fetchIsUserAdmin = async () => {
    try {
        const response = await fetch('/api/is_admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const msg = await response.json()
            return msg
        } else {
            console.error('Error sending data')
            // Handle error
        }
    } catch (error) {
        console.error('Error:', error)
        throw new Error('Failed handleRegisterServer')
    }
}
