// FILE: app/layout.tsx
import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/layout/ThemeProvider'
import NameGuard from '@/components/layout/NameGuard'
import SidebarWrapper from '@/components/layout/SidebarWrapper'

const ibmSans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const ibmMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'JHIC / Makerlab — Document System',
  description: 'Jassen Harris Industries Corporation Technical Document System',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ibmSans.variable} ${ibmMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <NameGuard>
            <SidebarWrapper>
              {children}
            </SidebarWrapper>
          </NameGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}