// 'use client'

import { cn } from '@/lib/utils/tailwind'
import BackButton from './back-button'

// import { cn } from '@/lib/utils/tailwind'
// import BackButton from './back-button'

interface HeaderProps {
  backButton?: boolean | 'rounded'
  title?: string
  rightContent?: React.ReactNode
  className?: string
}

// export default function Header({ backButton, title, rightContent, className }: HeaderProps) {
//   return (
//     <header className={cn('fixed top-0 right-0 left-0 z-50 bg-white shadow-sm', className)}>
//       <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3">
//         <nav className="flex min-w-0 flex-1 items-center">
//           {backButton != null && <BackButton rounded={backButton === 'rounded'} />}
//         </nav>
//         {title != null && <h1 className="flex-1 truncate text-center font-semibold">{title}</h1>}
//         {rightContent != null && <nav className="flex flex-1 items-center justify-end gap-2">{rightContent}</nav>}
//       </div>
//     </header>
//   )
// }

export default function Header({ backButton, title, rightContent, className }: HeaderProps) {
  return (
    <header className={cn('grid h-12 grid-cols-[auto_1fr_auto] items-center px-3', className)}>
      <div className="justify-self-start">{backButton != null && <BackButton rounded={backButton === 'rounded'} />}</div>
      <div className="justify-self-center truncate text-center text-2xl font-semibold text-black">{title}</div>
      <div className="flex items-center gap-2 justify-self-end">{rightContent}</div>
    </header>
  )
}
