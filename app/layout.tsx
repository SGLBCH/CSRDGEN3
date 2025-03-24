import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider'
import GoogleTagManager from './components/GoogleTagManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CSRD Report Generator',
  description: 'Create and manage CSRD reports easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background`}>
        <GoogleTagManager gtmId="GTM-K9WG7SG8" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
} 