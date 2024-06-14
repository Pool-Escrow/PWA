'use client'

import { Toaster } from '@/components/ui/toaster'
import { privy, queryClient, theme, wagmi } from '@/configs'
import { PrivyProvider } from '@privy-io/react-auth'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ThemeProvider } from 'next-themes'
import { WagmiProvider } from 'wagmi'

export default function Providers({ children }: React.PropsWithChildren) {
	return (
		<PrivyProvider {...privy}>
			<WagmiProvider {...wagmi}>
				<PersistQueryClientProvider {...queryClient}>
					<ThemeProvider {...theme}>
						{children}
						<Toaster />
					</ThemeProvider>
					{process.env.NODE_ENV === 'development' && (
						<ReactQueryDevtools initialIsOpen={false} />
					)}
				</PersistQueryClientProvider>
			</WagmiProvider>
		</PrivyProvider>
	)
}
