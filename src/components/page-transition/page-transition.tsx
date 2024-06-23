'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useFrozenRouter } from './frozen-router'
import { getTransitionProps, routeHierarchy } from './get-transition-props'

interface PageTransitionEffectProps {
    children: ReactNode
}

type ValidRoute = keyof typeof routeHierarchy

const PageTransitionEffect: React.FC<PageTransitionEffectProps> = ({ children }) => {
    const pathname = useFrozenRouter()
    const transitionProps = getTransitionProps({ to: pathname as ValidRoute })
    // const [prevPath, setPrevPath] = useState<ValidRoute>(pathname as ValidRoute)
    // const isInitialRender = useRef(true)

    // useEffect(() => {
    //     if (isInitialRender.current) {
    //         isInitialRender.current = false
    //     } else if (pathname !== prevPath) {
    //         setPrevPath(pathname as ValidRoute)
    //     }
    // }, [pathname, prevPath])

    // const transitionProps =
    //     pathname !== prevPath
    //         ? getTransitionProps({
    //               from: prevPath,
    //               to: pathname as ValidRoute,
    //           })
    //         : {}

    // const variants: Record<string, Variant> = {
    //     initial: { opacity: 0, ...transitionProps },
    //     animate: { opacity: 1, x: 0, y: 0 },
    //     exit: { opacity: 0, ...transitionProps },
    // }

    return (
        <AnimatePresence mode='popLayout' initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, ...transitionProps }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, ...transitionProps }}
                // initial='initial'
                // animate='animate'
                // exit='exit'
                // variants={variants}
                transition={{ duration: 0.3 }}>
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageTransitionEffect
