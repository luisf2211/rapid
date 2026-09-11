"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getGaId } from "@/lib/analytics/track";
import {
  parseAttributionFromSearch,
  persistFirstTouch,
} from "@/lib/analytics/attribution";

/**
 * Carga GA4 (si NEXT_PUBLIC_GA_ID está definido) y captura la atribución
 * first-touch (UTM + referrer) en cookie al montar. Se coloca una sola vez
 * en el layout raíz para no duplicar eventos.
 */
export function Analytics() {
  const gaId = getGaId();

  useEffect(() => {
    try {
      const attr = parseAttributionFromSearch(
        window.location.search,
        document.referrer,
        window.location.pathname,
      );
      if (attr) persistFirstTouch(attr);
    } catch {
      /* no bloquear render por atribución */
    }
  }, []);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
