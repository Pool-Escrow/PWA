import { ThemeProviderProps } from 'next-themes/dist/types'

export default {
	attribute: 'class',
	defaultTheme: 'system',
	disableTransitionOnChange: true,
} satisfies Omit<ThemeProviderProps, 'children'>
