import { createContext } from 'react'

// Context to detect if there's a hero section
const HeaderContext = createContext<{ hasHero: boolean }>({ hasHero: false })

export { HeaderContext }
