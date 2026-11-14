import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./styles/index.css";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LocaleProvider } from "./context/LocaleContext";
import { ProductProvider } from "./context/ProductContext";
import { OffersProvider } from "./context/OffersContext";
import { getOffersSafe } from "@/lib/offers/repository";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FacebookPixel from "./components/FacebookPixel";
import { WhatsAppStickyButton } from "./components/WhatsAppStickyButton";
import { GoogleTagManager } from '@next/third-parties/google'
import { TRACKING_ENABLED } from "@/lib/tracking/config";

const GTM_ID = TRACKING_ENABLED ? process.env.NEXT_PUBLIC_GTM_ID : undefined;


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.hickoku.com"),
  title: "Hickoku Perfumes",
  description: "Affordable Premium Perfume Brand for Everyone",
  keywords: ["Mother's Day Special", "best perfume for men", "best perfume for women", "luxury scents India", "top rated fragrances", "alcohol free perfumes", "attar under 250","rose flavour attar","rose flavour perfume", "perfume under 250","premium perfumes", "affordable luxury fragrances", "Hickoku perfumes", "buy original attars online India","buy original perfumes online India", "long lasting attars", "long lasting attar"],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "Hickoku Perfumes",
    description: "Affordable Premium Perfume Brand for Everyone",
    url: "/",
    siteName: "Hickoku Perfumes",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 600,
        alt: "Hickoku Perfumes Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hickoku Perfumes",
    description: "Affordable Premium Perfume Brand for Everyone",
    images: ["/images/logo.png"],
  },
  other: {
    "facebook-domain-verification": "0ll7p818bfpmfos2g6x38xgoirgynf",
    ...(process.env.FB_APP_ID && { "fb:app_id": process.env.FB_APP_ID }),
    ...(process.env.PINTEREST_VERIFY && { "p:domain_verify": process.env.PINTEREST_VERIFY }),
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Offers set in the admin panel. Pages built at deploy time get this snapshot; the
  // OffersProvider refreshes it in the browser.
  const offers = await getOffersSafe();
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {/* GA4 is loaded through GTM (Google tag in the container), not directly */}

        <LocaleProvider>

          <ProductProvider>
            <OffersProvider initialOffers={offers}>
            <CartProvider>
              {children}
              <CartDrawer />
              <WhatsAppStickyButton />
              <Toaster position="top-right" />
            </CartProvider>
            </OffersProvider>
          </ProductProvider>
        </LocaleProvider>
        <Analytics/>
        <SpeedInsights/>
        <FacebookPixel />
      </body>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
    </html>

  );
}
