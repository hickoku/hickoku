"use client";

import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { useLocale } from "../context/LocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openCart, getCartItemCount } = useCart();
  const { t } = useLocale();
  const cartCount = getCartItemCount();

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20">
          <div className="flex items-center justify-between h-full">
            {/* Left - Menu */}
            <div className="flex items-center gap-2 sm:gap-6 flex-1">
              {/* <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button> */}
              {/* <nav className="hidden lg:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  {t("navigation.new")}
                </Link>
                <Link
                  href="/collection"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  {t("navigation.forHer")}
                </Link>
                <Link
                  href="/collection"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  {t("navigation.forHim")}
                </Link>
                <Link
                  href="/collection"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  {t("navigation.collections")}
                </Link>
              </nav> */}
            </div>

            {/* Center - Logo */}
            <Link
              href="/"
              className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                // whileHover={{ scale: 1.08 }}
                className="flex items-center justify-center px-2 sm:px-4 lg:px-6  transition-colors"
              >
                <img
                  src={"/images/logo.png"}
                  alt="HK Logo"
                  className="h-12 sm:h-16 lg:h-20 object-contain"
                />
              </motion.div>
            </Link>

            {/* Right - Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 lg:gap-7 flex-1">
              <Link
                href="/collection"
                className="text-sm font-medium hover:text-gray-600 transition-colors"
              >
                {t("navigation.collections")}
              </Link>
              {/* Search - Hidden */}
              {/* Heart - Hidden */}
              {/* Language Switcher - Hidden */}
              <motion.button
                onClick={openCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
              {/* User Icon - Hidden */}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <div className="mb-8 mt-2">
                  <img
                    src={"/images/logo.png"}
                    alt="HK Logo"
                    className="h-16 object-contain"
                  />
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium hover:text-gray-600 transition-colors py-2 border-b border-gray-100"
                  >
                    {t("navigation.new")}
                  </Link>
                  <Link
                    href="/collection"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium hover:text-gray-600 transition-colors py-2 border-b border-gray-100"
                  >
                    {t("navigation.forHer")}
                  </Link>
                  <Link
                    href="/collection"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium hover:text-gray-600 transition-colors py-2 border-b border-gray-100"
                  >
                    {t("navigation.forHim")}
                  </Link>
                  <Link
                    href="/collection"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium hover:text-gray-600 transition-colors py-2 border-b border-gray-100"
                  >
                    {t("navigation.collections")}
                  </Link>
                </nav>

                {/* Mobile-only Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                  <button className="flex items-center gap-3 w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <Search className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {t("navigation.search")}
                    </span>
                  </button>
                  <button className="flex items-center gap-3 w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Wishlist</span>
                  </button>
                  <button className="flex items-center gap-3 w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Account</span>
                  </button>
                  <div className="p-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
