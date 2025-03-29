'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import the VideoPlayer to avoid server-side rendering issues with cookies
const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false })

export default function VideoPlayerWrapper() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Only show after component is mounted on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render on server side - cookies are client-side only
  if (!mounted) return null

  // Extract the Vimeo video ID from the full URL/embed code
  // The provided embed code has video ID 1070582894
  const videoId = '1070582894'

  return <VideoPlayer videoId={videoId} />
} 