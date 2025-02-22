export const routeHierarchy = {
    '/': { level: 0 },
    '/pools': { level: 0 },
    '/my-pools': { level: 1 },
    '/profile': { level: 2 },
}

export const transitionLevel = {
    deeper: { x: 0, y: '100%' },
    shallower: { x: 0, y: '-100%' },
    parallelForward: { x: '-100%', y: 0 },
    parallelBackward: { x: '100%', y: 0 },
}

export const getTransitionProps = (pathname: string) => {
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
