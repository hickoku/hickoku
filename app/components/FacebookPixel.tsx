"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, Suspense } from "react";
import * as fpixel from "@/lib/fpixel";
import { TRACKING_ENABLED } from "@/lib/tracking/config";
import { VISITOR_COOKIE, MATCHING_STORAGE_KEY } from "@/lib/tracking/normalize";

const FacebookPixelComponent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // PageView on client-side navigations (the snippet below sends the first one)
  useEffect(() => {
    fpixel.pageview();
  }, [pathname, searchParams]);

  if (!TRACKING_ENABLED || !fpixel.FB_PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            (function(){
              // Visitor ID (external_id), see lib/tracking/identity.ts
              var vid = null, m = document.cookie.match(/(?:^|; )${VISITOR_COOKIE}=([^;]+)/);
              if (m) { vid = decodeURIComponent(m[1]); }
              else {
                vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
                  : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
                document.cookie = '${VISITOR_COOKIE}=' + encodeURIComponent(vid) + '; Max-Age=63072000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
              }
              // Returning customer: start with their hashed details. New visitors start
              // empty so identifyCustomer() can add details at checkout (the pixel only
              // accepts user data once per page load).
              var am = null;
              try { am = JSON.parse(localStorage.getItem('${MATCHING_STORAGE_KEY}') || 'null'); } catch (e) {}
              if (am && (am.em || am.ph)) {
                am.external_id = vid;
                fbq('init', '${fpixel.FB_PIXEL_ID}', am);
              } else {
                fbq('init', '${fpixel.FB_PIXEL_ID}');
              }
            })();
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
};

export default function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelComponent />
    </Suspense>
  );
}
