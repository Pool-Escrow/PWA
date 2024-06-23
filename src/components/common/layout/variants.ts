const fadeInOutVariants = {
    initial: {
        opacity: 0.5,
    },
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0.5,
    },
}

const fadeInOutTransition = {
    duration: 0.3,
    ease: 'easeInOut',
}

const slideUpDownVariants = {
    initial: {
        opacity: 0.8,
        y: '10vh',
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0.8,
        y: '-10vh',
    },
}

const slideUpDownTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
}

// MyPools specific animations
const tabIndicatorVariants = {
    visible: {
        transition: {
            type: 'spring',
            bounce: 0.2,
            duration: 0.4,
        },
    },
    hidden: {
        opacity: 0,
    },
}

const tabContentVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '50%' : '-50%',
        // z: direction > 0 ? -0.5 : 0,
        // opacity: 0,
    }),
    center: {
        x: 0,
        // z: 1,
        // opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? '-50%' : '50%',
        // z: direction > 0 ? -0.5 : 0,
        // opacity: 0,
        transition: {
            duration: 0.6,
        },
    }),
}

const tabTransition = {
    type: 'spring',
    bounce: 0.2,
    duration: 0.4,
}

const cardVariants = {
    initial: (next: boolean) => ({
        x: next ? 150 : -150,
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: { type: 'tween', duration: 0.5 },
    },
    exit: (next: boolean) => ({
        x: next ? -150 : 150,
        opacity: 0,
        transition: { type: 'tween', duration: 0.5 },
    }),
}

export {
    cardVariants,
    fadeInOutVariants,
    fadeInOutTransition,
    slideUpDownVariants,
    slideUpDownTransition,
    tabIndicatorVariants,
    tabContentVariants,
    tabTransition,
}
