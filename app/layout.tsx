import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider'
import GoogleTagManager, { GoogleTagManagerNoScript, PageViewTracker } from './components/GoogleTagManager'
import dynamic from 'next/dynamic'

// Dynamically import the VideoPlayerWrapper to avoid SSR issues with cookies
const VideoPlayerWrapper = dynamic(() => import('./components/VideoPlayerWrapper'), { ssr: false })

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
      <head>
        <GoogleTagManager />
      </head>
      <body className={`${inter.className} bg-background`}>
        <GoogleTagManagerNoScript />
        <AuthProvider>
          <PageViewTracker />
          {children}
          <VideoPlayerWrapper />
        </AuthProvider>
      </body>
    </html>
  )
} 