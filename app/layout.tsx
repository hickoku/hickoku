import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./styles/index.css";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LocaleProvider } from "./context/LocaleContext";
import { ProductProvider } from "./context/ProductContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FacebookPixel from "./components/FacebookPixel";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://www.hickoku.com"),
  title: "Hickoku Perfumes",
  description: "Affordable Premium Perfume Brand for Everyone",
  keywords: ["alcohol free perfumes", "attar under 250","rose flavour attar","rose flavour perfume", "perfume under 250","premium perfumes", "affordable luxury fragrances", "Hickoku perfumes", "buy original attars online India","buy original perfumes online India", "long lasting attars", "long lasting attar"],
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
    ...(process.env.FB_APP_ID && { "fb:app_id": process.env.FB_APP_ID }),
    ...(process.env.PINTEREST_VERIFY && { "p:domain_verify": process.env.PINTEREST_VERIFY }),
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <LocaleProvider>
          <ProductProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <Toaster position="top-right" />
            </CartProvider>
          </ProductProvider>
        </LocaleProvider>
        <Analytics/>
        <SpeedInsights/>
        <FacebookPixel />
      </body>
    </html>
  );
}
