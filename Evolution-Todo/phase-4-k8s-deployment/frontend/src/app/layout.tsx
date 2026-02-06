import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Providers } from './providers'
import { SkipNavigation } from '@/components/layout/skip-navigation'
import Script from 'next/script'


// Using local font to avoid network dependency during build
const inter = {
  className: 'font-sans antialiased',
  variable: '--font-inter'
}

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
        {/* CRITICAL: Load ChatKit CDN script for widget styling */}
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
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