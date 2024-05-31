export const safeLoadEnv = (name: string): string => {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Please provide a ${name} in your .env file`)
	}
	return value
}
