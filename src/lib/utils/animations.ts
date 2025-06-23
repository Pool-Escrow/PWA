export const getPageTransition = (pathname: string | null) => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' && pathname) {
        console.log(`[PageTransition] Generating transition for: ${pathname}`)
    }

    const isProfilePage = pathname === '/profile'

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
