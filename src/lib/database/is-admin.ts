export const fetchIsUserAdmin = async () => {
    try {
        const response = await fetch('/api/is_admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const msg = await response.json()
            return msg
        } else {
            console.log('Failed to fetch admin status')
            console.error(response.status)
            // Handle error
            return { isAdmin: false }
        }
    } catch (error) {
        console.error('Error:', error)
        throw new Error('Failed handleRegisterServer')
    }
}
