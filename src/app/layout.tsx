import { ViewTransitions } from 'next-view-transitions'
import { PreloadResources } from '@/components/preload-resources'
import Providers from '@/components/providers'
import { inter } from '@/lib/utils/fonts'

import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <PreloadResources />
        <body className={inter.variable}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ViewTransitions>
  )
}
