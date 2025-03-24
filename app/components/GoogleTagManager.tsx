'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface GoogleTagManagerProps {
  gtmId?: string
}

export default function GoogleTagManager({ gtmId = 'GTM-K9WG7SG8' }: GoogleTagManagerProps) {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
  }, [])

  return (
    <>
      {/* GTM Script - This would normally go in the head, but Next.js Script component handles this */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
          `
        }}
      />
      
      {/* GTM noscript iframe - This goes in the body */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

// Add this for TypeScript support
declare global {
  interface Window {
    dataLayer: any[]
  }
} 