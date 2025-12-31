import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Providers } from './providers'
import Nav from '@/components/Navbar/Nav'
import { SkipNavigation } from '@/components/layout/skip-navigation'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A full-featured todo application with authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SkipNavigation />
        <Providers>
          <AuthProvider>
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}