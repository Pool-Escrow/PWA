export const getPageTransition = (pathname: string | null) => {
    const isProfilePage = pathname === '/profile'

    // Reduce log noise - only log on actual route changes, not repeated calls
    if (
        process.env.NODE_ENV === 'development' &&
        pathname &&
        !pathname.startsWith('/_next/') &&
        !pathname.includes('.') &&
        pathname !== globalThis.__lastLoggedPath
    ) {
        console.log(`[PageTransition] Generating transition for: ${pathname}`)
        globalThis.__lastLoggedPath = pathname
    }

    return {
        variants: {
            initial: {
                x: isProfilePage ? '100%' : '-100%',
                opacity: 0,
            },
            animate: {
                x: 0,
                opacity: 1,
            },
            exit: {
                x: isProfilePage ? '100%' : '-100%',
                opacity: 0,
            },
        },
        transition: {
            type: 'tween',
            duration: 0.3,
            ease: 'easeInOut',
        },
    }
}
