'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'

interface VideoPlayerProps {
  videoId: string
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Check if the video has been closed before (stored in cookies)
  useEffect(() => {
    const checkCookie = () => {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return null
      }

      const videoClosed = getCookie('csrdVideoWatched')
      if (videoClosed !== 'true') {
        setIsVisible(true)
      }
    }

    // Wait for document to be fully loaded
    if (typeof document !== 'undefined') {
      checkCookie()
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Set cookie to remember that the user closed the video
    document.cookie = 'csrdVideoWatched=true; max-age=31536000; path=/' // 1 year expiration
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    
    // When expanding, ensure autoplay is enabled
    if (!isExpanded && iframeRef.current) {
      const src = iframeRef.current.src
      if (!src.includes('autoplay=1')) {
        iframeRef.current.src = src.includes('?') 
          ? `${src}&autoplay=1` 
          : `${src}?autoplay=1`
      }
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded 
          ? 'inset-0 flex items-center justify-center bg-black bg-opacity-75' 
          : 'bottom-4 right-4 w-80 h-45 shadow-lg rounded-lg overflow-hidden'
      }`}
    >
      <div 
        className={`relative ${
          isExpanded ? 'w-4/5 max-w-4xl' : 'w-full h-full'
        }`}
      >
        <button
          onClick={handleClose}
          className={`absolute z-10 p-2 rounded-full bg-gray-900 bg-opacity-70 text-white ${
            isExpanded ? 'top-2 right-2' : 'top-1 right-1'
          }`}
          aria-label="Close video"
        >
          <XMarkIcon className={isExpanded ? 'h-8 w-8' : 'h-5 w-5'} />
        </button>
        
        <div 
          className={`${!isExpanded ? 'cursor-pointer' : ''}`} 
          onClick={!isExpanded ? handleToggleExpand : undefined}
        >
          <div style={{padding:'56.25% 0 0 0', position:'relative'}}>
            <iframe 
              ref={iframeRef}
              src={`https://player.vimeo.com/video/${videoId}?h=82c54388fd&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479${!isExpanded ? '&autoplay=1&muted=1' : ''}`}
              style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              title="CSRD Tutorial with Voice"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
} 