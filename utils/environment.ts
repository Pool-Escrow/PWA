export const safeLoadEnv = (name: string): string => {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Please provide a ${name} in your .env file`)
	}
	return value
}

export const loadEnvironmentUrls = () => {
	const bundlerUrl = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL
	const paymasterUrl = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL

	if (!bundlerUrl || !paymasterUrl) {
		throw new Error('Missing Biconomy environment variables')
	}

	return { bundlerUrl, paymasterUrl }
}
