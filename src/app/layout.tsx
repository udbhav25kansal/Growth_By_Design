import type { Metadata } from 'next'
import './globals.css'
import { AppHeader } from '@/frontend/components'

// Initialize database on app startup
import '@/backend/database/init'

export const metadata: Metadata = {
  title: 'Growth By Design App',
  description: 'A modern web application built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  )
} 