// src/components/page-transition/frozen-router.ts

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// function FrozenRouter(props: { children: React.ReactNode }) {
//     const context = useContext(LayoutRouterContext)
//     const frozen = useRef(context).current

//     return <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
// }

export const useFrozenRouter = () => {
    const pathname = usePathname()
    const [frozenPathname, setFrozenPathname] = useState(pathname)

    useEffect(() => {
        if (pathname !== frozenPathname) {
            setFrozenPathname(pathname)
        }
    }, [pathname, frozenPathname])

    return frozenPathname
}
