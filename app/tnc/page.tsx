"use client";

import { motion, Variants } from "framer-motion";
import { Scale, ShieldCheck, Box, CreditCard, RefreshCcw, HandPlatter, FileText, AlertTriangle, Gavel, ArrowLeft } from "lucide-react";
import { Header } from "../components/Header";
import Link from "next/link";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function TermsAndConditionsPage() {
  const termsSections = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      title: "Brand Identity & Acceptance",
      content: "Hickoku operates from Maharashtra, India. By accessing our website or purchasing our products, you agree to these Terms & Conditions. All brand content including logo, product names, packaging, and website material are exclusive property of Hickoku. Unauthorized use is prohibited."
    },
    {
      icon: <Box className="w-6 h-6 text-amber-600" />,
      title: "Product Nature & Pricing",
      content: "Hickoku products are concentrated alcohol-free attar perfume oils. Natural variations in scent or color may occur. All prices are in INR (₹). Products comply with the Legal Metrology Rules, 2011. The printed MRP is inclusive of all applicable taxes."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      title: "Orders & Payment",
      content: "Orders are confirmed only after successful payment. Hickoku reserves the right to cancel orders due to stock issues, pricing errors, or suspected fraud. Refunds (if applicable) are processed within 5–7 business days."
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-amber-600" />,
      title: "Returns & Refunds",
      content: "Due to hygiene and personal use nature, opened products cannot be returned. Damaged or incorrect items must be reported within 24 hours with proof. Approved refunds/replacements are processed within 7–10 business days."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      title: "Skin Sensitivity & Liability",
      content: "Attars are highly concentrated oils. Patch test recommended. Discontinue use if irritation occurs. Hickoku is not responsible for allergic reactions. Liability is strictly limited to the purchase value of the product."
    },
    {
      icon: <Gavel className="w-6 h-6 text-amber-600" />,
      title: "Governing Law",
      content: "These Terms are governed by Indian law. Jurisdiction: Maharashtra, India. By utilizing our platform, you implicitly agree to resolve disputes within the state boundaries of our operations."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 overflow-hidden relative selection:bg-amber-500/20">
      <Header />
      
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute top-[0%] right-[10%] w-[40%] h-[40%] bg-amber-400/10 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-32 relative z-10">
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
              <Scale className="w-4 h-4" /> Legal
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeUpVariant}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 drop-shadow-sm"
          >
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Conditions.</span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariant}
            className="text-lg text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            Please read these terms carefully before engaging with our platform or purchasing our premium fragrances. Your access is conditioned upon accepting these policies.
          </motion.p>
          <motion.p variants={fadeUpVariant} className="text-xs text-amber-600/60 mt-4 font-mono">
            LAST UPDATED: 15 FEB 2026
          </motion.p>
        </motion.div>

        <div className="space-y-6">
          {termsSections.map((section, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" } 
                }
              }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-white/70 border border-gray-100/80 backdrop-blur-xl group transition-all duration-300 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200 flex flex-col md:flex-row gap-6 items-start"
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
