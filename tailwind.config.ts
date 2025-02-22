import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
    content: ['./src/**/*.tsx'],
    darkMode: ['class', '[data-mode="dark"]'],
    // prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'skeleton-pulse': 'skeleton-fade-in 0.8s ease-out forwards, skeleton-shimmer 2s infinite linear',
            },
            backgroundImage: {
                // Remove the gradient definitions from backgroundImage
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                mini: 'var(--border-radius-mini)',
            },
            boxShadow: {
                'panel': '0px -2px 22.6px 0px rgba(79, 79, 79, 0.25)',
                'button': '0px 1.75px 0px 0px rgba(255, 255, 255, 0.25) inset',
                'button-push': '0px -1.75px 0px 0px rgba(255, 255, 255, 0.25) inset',
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                panel: {
                    DEFAULT: 'hsl(var(--panel))',
                },
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
            },
            fontFamily: {
                body: 'var(--font-body), "Inter-fallback", sans-serif',
            },
            height: {
                'top-bar': 'var(--top-bar-height)',
                'bottom-bar': 'var(--bottom-bar-height)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'shine-pulse': {
                    '0%': {
                        'background-position': '0% 0%',
                    },
                    '50%': {
                        'background-position': '100% 100%',
                    },
                    'to': {
                        'background-position': '0% 0%',
                    },
                },
                'skeleton-fade-in': {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.98)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                    },
                },
                'skeleton-shimmer': {
                    '0%': {
                        backgroundPosition: '-200% 0',
                    },
                    '100%': {
                        backgroundPosition: '200% 0',
                    },
                },
            },
            padding: {
                'top-bar-h': 'var(--top-bar-height)',
                'bottom-bar-h': 'var(--bottom-bar-height)',
            },
            textShadow: {
                inner: '0 3px 4px #fff, 0 0 0 #151515, 0px 3px 4px #fff',
            },
            width: {
                100: '25rem',
                104: '26rem',
                108: '27rem',
                112: '28rem',
                116: '29rem',
                120: '30rem',
                124: '31rem',
                128: '32rem',
                256: '64rem',
            },
            gradientColorStops: ({ theme }) =>
                ({
                    ...theme('colors'),
                    'cta-start': '#36a0f7',
                    'cta-end': '#1364da',
                    'cta-active-start': '#2b80c5',
                    'cta-active-end': '#0f50af',
                }) as Record<string, string>,
        },
    },
    plugins: [
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('tailwindcss-animate'),
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('tailwindcss-safe-area'),
        plugin(function ({
            addUtilities,
        }: {
            addUtilities: (utilities: Record<string, Record<string, string>>) => void
        }): void {
            addUtilities({
                '.overflow-scrolling-touch': {
                    '-webkit-overflow-scrolling': 'touch',
                },
            })
        }),
    ],
}

export default config
