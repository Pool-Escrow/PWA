export const getPageTransition = (pathname: string) => {
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
        },
    }
}
