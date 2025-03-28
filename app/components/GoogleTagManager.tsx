'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Component to track route changes and send pageview events
function PageViewTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (pathname) {
      // Construct the full URL
      const queryString = searchParams?.toString()
      const url = queryString ? `${pathname}?${queryString}` : pathname
      
      // Push the pageview to dataLayer
      window.dataLayer?.push({
        event: 'page_view',
        page_path: pathname,
        page_url: url,
        page_title: document.title
      })
      
      console.log('Page view tracked:', pathname)
    }
  }, [pathname, searchParams])
  
  return null
}

// Wrap the PageViewTracker in a Suspense boundary
export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  )
}

export default function GoogleTagManager() {
  return (
    <>
      {/* Initialize dataLayer before GTM */}
      <Script
        id="gtm-dataLayer-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          `
        }}
      />
      
      {/* GTM Script - This gets added to the head */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K9WG7SG8');
          `
        }}
      />
    </>
  )
}

// Separate component for the body part, which will be rendered directly in the layout
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-K9WG7SG8"
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
} 