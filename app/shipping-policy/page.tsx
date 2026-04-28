"use client";

import { motion, Variants } from "framer-motion";
import { ArrowLeft, Truck, Clock, Globe, Search, AlertCircle } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import Link from "next/link";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function ShippingPolicyPage() {
  const policies = [
    {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      title: "Order Processing Time",
      content: "All orders are processed within 1-2 business days (excluding weekends and public holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped, containing your Airway Bill (AWB) status link."
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      title: "Domestic Shipping Rates",
      content: <>Shipping charges for your order will be calculated and displayed dynamically at checkout. Standard Delivery usually takes <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">3 to 7 business days</span> depending on your location.</>
    },
    {
      icon: <Globe className="w-6 h-6 text-amber-600" />,
      title: "International Shipping",
      content: "Currently, we only ship across India. We do not offer international shipping at this time, but we are looking forward to expanding our services globally soon."
    },
    {
      icon: <Search className="w-6 h-6 text-amber-600" />,
      title: "Order Tracking",
      content: <>When your order has shipped, you will receive an email notification from us with a tracking number. You can also use the <span className="font-medium text-gray-900 border-b border-gray-300 italic">Track Order</span> tool in our footer to monitor delivery.</>
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      title: "Delivery Issues",
      content: <>If your order arrives damaged or is delayed, please <Link href="/contact-us" className="text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-4 decoration-amber-500/30">contact us</Link> immediately. We address these on a case-by-case basis to ensure a satisfactory resolution.</>
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 overflow-hidden relative selection:bg-amber-500/20">
      <Header />
      
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-amber-400/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 relative z-10 w-full font-sans">
        <div className="mb-12 flex justify-start z-20 relative">
          <Link href="/">
            <motion.button
              whileHover={{ x: -3 }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm cursor-pointer font-medium tracking-wide">Return to Store</span>
            </motion.button>
          </Link>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-16"
        >
          <div className="text-center">
            <motion.div variants={fadeUpVariant} className="flex justify-center mb-6">
              <span className="px-5 py-2 rounded-full border border-amber-200/50 bg-amber-50/50 backdrop-blur-sm text-amber-700 text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm">
                Logistics & Delivery
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUpVariant}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-gray-900 drop-shadow-sm"
            >
              Shipping <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Policy.</span>
            </motion.h1>

            <motion.p 
              variants={fadeUpVariant}
              className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto"
            >
              Excellence in service, delivered with care. We ensure your luxury fragrances reach you in pristine condition, anywhere in India.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {policies.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariant}
                whileHover={{ y: -5 }}
                className="relative p-8 rounded-[2rem] border border-gray-200/60 backdrop-blur-md bg-white/30 hover:bg-white/50 transition-all duration-500 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-amber-500/5 hover:border-amber-200/50 group"
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 shadow-sm text-amber-600">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-amber-800 transition-colors duration-500 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-500 text-[15px]">
                    {item.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeUpVariant}
            className="p-8 md:p-12 rounded-[2.5rem] border border-amber-200/40 bg-gradient-to-br from-amber-50/80 to-transparent backdrop-blur-xl text-center relative overflow-hidden group shadow-lg"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                Our support team is always ready to help you with your order status or delivery queries.
              </p>
              <Link href="/contact-us">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all tracking-wider text-sm"
                >
                  CONTACT SUPPORT
                </motion.button>
              </Link>
            </div>
            {/* Background Accent */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-400/10 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
