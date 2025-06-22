import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppHeader from '@/components/ui/AppHeader'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  )
} 