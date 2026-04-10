import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./styles/index.css";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LocaleProvider } from "./context/LocaleContext";
import { ProductProvider } from "./context/ProductContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      </body>
    </html>
  );
}
