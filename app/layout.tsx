import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./styles/index.css";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LocaleProvider } from "./context/LocaleContext";
import { ProductProvider } from "./context/ProductContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from "next/dynamic";

const GoogleAnalytics = dynamic(
  () => import("@next/third-parties/google").then((mod) => mod.GoogleAnalytics),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Hickoku Perfumes",
  description: "Affordable Premium Perfume Brands for Everyone",
  icons: {
    icon: "/images/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
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
        {process.env.GA_ID && (
          <GoogleAnalytics gaId={process.env.GA_ID} />
        )}
      </body>
    </html>
  );
}
