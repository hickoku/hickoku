"use client";

import { Instagram, Facebook, Twitter } from "lucide-react";
import { motion } from "motion/react";
import { useLocale } from "../context/LocaleContext";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl mb-4 tracking-wider">
              {t("footer.brand")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <motion.a
                href="https://www.instagram.com/hickokuperfume"
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://www.facebook.com/hickoku/"
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://x.com/hickokoperfumes"
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </motion.a>
              
            </div>
          </div>

          {/* Shop */}
          {/* <div>
            <h4 className="mb-4 tracking-wider uppercase text-sm">
              {t("footer.shop")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.newArrivals")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.bestSellers")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("navigation.collections")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.giftSets")}
                </a>
              </li>
            </ul>
          </div> */}

          {/* Support */}
          <div>
            <h4 className="mb-4 tracking-wider uppercase text-sm">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/contact-us"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.contactUs")}
                </a>
              </li>

              {/* <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.shippingInfo")}
                </a>
              </li> 
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.returns")}
                </a>
              </li> 
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.faq")}
                </a>
              </li>*/}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 tracking-wider uppercase text-sm">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/why-choose-us"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.whyChooseUs")}
                </a>
              </li>
              <li>
                <a
                  href="/about-us"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  About Us
                </a>
              </li>
              {/* <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Careers
                </a>
              </li> */}
              {/* <li>
                <a
                  href="/privacy-policy"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a
                  href="/tnc"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.terms")}
                </a>
              </li> */}
            </ul>
          </div>

          {/* Order Tracking */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="mb-4 tracking-wider uppercase text-sm">
              Track Order
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Enter order ID to check status
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = (formData.get("orderId") as string).trim();
                
                if (query) {
                  // If it looks like a Delhivery AWB (numeric and length ~14, or generic > 10 chars)
                  if (/^\d+$/.test(query) && query.length >= 10) {
                    window.open(`https://www.delhivery.com/track-v2/package/${query}`, "_blank");
                  } else {
                    window.location.href = `/order-tracking/${query}`;
                  }
                }
              }}
              className="space-y-2"
            >
              <input
                type="text"
                name="orderId"
                placeholder="Order ID or AWB"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Track
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">
              © 2026 HICKOKU. All rights reserved.
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
              Powered by Zaviyar Corporation
            </p>
          </div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a
              href="/privacy-policy"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t("footer.privacy")}
            </a>
            <a
              href="/tnc"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t("footer.terms")}
            </a>
            {/* <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Cookies
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
