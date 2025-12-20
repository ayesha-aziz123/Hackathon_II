/**
 * Next.js Root Layout Template
 *
 * Usage:
 * 1. Copy this file to app/layout.tsx
 * 2. Add your providers
 * 3. Configure metadata
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "My App",
    template: "%s | My App",
  },
  description: "My application description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}

        </Providers>
          <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: { background: '#10b981' },
            },
            error: {
              style: { background: '#ef4444' },
            },
          }}
        />
      </body>
    </html>
  );
}
