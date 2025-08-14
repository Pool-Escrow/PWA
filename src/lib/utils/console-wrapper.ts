type ConsoleLevel = 'log' | 'warn' | 'error'

function initializeNoiseFilter() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const noisy = {
      log: [],
      warn: [
        'Lit is in dev mode',
        'WalletConnect Core is already initialized',
        'Each child in a list should have a unique "key" prop',
        'Check the render method of',
        'It was passed a child from',
        'react.dev/link/warning-keys',
        'privy-provider',
        'warning-keys',
        'Skipping auto-scroll behavior',
      ],
      error: [
        'Each child in a list should have a unique "key" prop',
        'Check the render method of',
        'It was passed a child from',
        'react.dev/link/warning-keys',
        'privy-provider',
        'warning-keys',
      ],
    } as const

    Object.entries(noisy).forEach(([level, patterns]) => {
      const consoleLevel = level as ConsoleLevel
      // eslint-disable-next-line no-console
      const originalMethod = console[consoleLevel] as (...args: unknown[]) => void

      ;(console as Pick<Console, ConsoleLevel>)[consoleLevel] = (...args: unknown[]) => {
        const firstArg = args[0]
        if (typeof firstArg === 'string' && patterns.some(pattern => firstArg.includes(pattern))) {
          return undefined
        }
        return originalMethod.apply(console, args)
      }
    })
  }
}

// Auto-initialize when module is imported
initializeNoiseFilter()

// Export for proper ESM module format
export default initializeNoiseFilter
