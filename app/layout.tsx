import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Favicon } from '@/components/Favicon'
import { PageLoaderWrapper } from '@/components/PageLoaderWrapper'

export const metadata: Metadata = {
  title: 'Liberty National Bank',
  description: 'Modern, secure online banking platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Favicon />
        <Providers>
          <PageLoaderWrapper />
          {children}
        </Providers>
      </body>
    </html>
  )
}




