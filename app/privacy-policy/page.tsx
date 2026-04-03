"use client";

import { motion, Variants } from "framer-motion";
import { Lock, Eye, Server, UserCheck, ShieldClose, ArrowLeft } from "lucide-react";
import { Header } from "../components/Header";
import Link from "next/link";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function PrivacyPolicyPage() {
  const privacySections = [
    {
      icon: <Eye className="w-6 h-6 text-amber-600" />,
      title: "Data We Collect",
      content: "We collect information you provide directly to us when making a purchase, such as your name, billing address, shipping address, payment information, email address, and phone number. We also automatically collect certain device information using cookies to enhance your browsing experience."
    },
    {
      icon: <Server className="w-6 h-6 text-amber-600" />,
      title: "How We Use Your Data",
      content: "Your data is primarily used to fulfill your orders, process payments securely through our partner Razorpay, arrange for shipping, and provide you with invoices or order confirmations. We additionally use data to screen for potential risk or fraud."
    },
    {
      icon: <ShieldClose className="w-6 h-6 text-amber-600" />,
      title: "Data Sharing & Third Parties",
      content: "We share your personal information exclusively with trusted third parties to help us fulfill your orders (e.g. delivery partners, payment gateways). We do not sell or rent your personal information to marketing agencies or unauthorized third parties."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-amber-600" />,
      title: "Your Rights & Retention",
      content: "When you place an order, we will maintain your Order Information for our records unless you ask us to delete this information. You hold the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-hidden relative selection:bg-amber-500/20">
      <Header />
      
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-amber-400/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-32 relative z-10">
        <div className="mb-8 flex justify-start z-20 relative">
          <Link href="/">
            <motion.button
              whileHover={{ x: -3 }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm cursor-pointer font-medium tracking-wide">Back</span>
            </motion.button>
          </Link>
        </div>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUpVariant} className="flex justify-center mb-6">
            <span className="px-5 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold tracking-widest uppercase shadow-sm flex items-center gap-2">
              <Lock className="w-4 h-4" /> Security
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeUpVariant}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 drop-shadow-sm"
          >
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Policy.</span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariant}
            className="text-lg text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            Your privacy is our priority. Discover exactly how we collect, use, and securely shield your personal information while you interact with Hickoku.
          </motion.p>
          <motion.p variants={fadeUpVariant} className="text-xs text-amber-600/60 mt-4 font-mono">
            LAST UPDATED: 15 FEB 2026
          </motion.p>
        </motion.div>

        <div className="space-y-6">
          {privacySections.map((section, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { 
                  opacity: 1, 
                  x: 0, 
                  transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" } 
                }
              }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-white border border-gray-100/80 backdrop-blur-xl group transition-all duration-300 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200 flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
                {section.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-amber-800 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors text-[15px]">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}