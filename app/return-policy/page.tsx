"use client";

import { motion, Variants } from "framer-motion";
import { ArrowLeft, RefreshCw, ShieldCheck, CreditCard, XCircle, Mail } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import Link from "next/link";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function ReturnPolicyPage() {
  const policies = [
    {
      icon: <RefreshCw className="w-6 h-6 text-amber-600" />,
      title: "Returns Eligibility",
      content: <>We accept returns within <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">7 days</span> of delivery. Items must be unused, unsealed, and in original packaging. Unsealed perfumes cannot be returned for hygiene reasons.</>
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      title: "Defective Products",
      content: <>If you receive a damaged bottle or defective atomizer, please contact us within <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">48 hours</span>. We require photo evidence to process an immediate replacement.</>
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      title: "Refund Process",
      content: "Once inspected at our warehouse, approved refunds are processed to your original payment method within 5-7 business days. Original shipping costs are non-refundable."
    },
    {
      icon: <XCircle className="w-6 h-6 text-amber-600" />,
      title: "Cancellations",
      content: "Orders can only be canceled if they have not been processed or dispatched. Once shipped, the standard return policy applies for all orders."
    },
    {
      icon: <Mail className="w-6 h-6 text-amber-600" />,
      title: "Initiate Return",
      content: <>Simply reach out to us via our <Link href="/contact-us" className="text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-4 decoration-amber-500/30">Contact section</Link> with your Order ID to start a return request.</>
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
                Trust & Satisfaction
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUpVariant}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-gray-900 drop-shadow-sm"
            >
              Return <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Policy.</span>
            </motion.h1>

            <motion.p 
              variants={fadeUpVariant}
              className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto"
            >
              Quality is our promise. If your experience isn't perfect, we are here to make it right through our fair and transparent returns process.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariant}
                whileHover={{ y: -5 }}
                className={`relative p-8 rounded-[2rem] border border-gray-200/60 backdrop-blur-md bg-white/30 hover:bg-white/50 transition-all duration-500 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-amber-500/5 hover:border-amber-200/50 group ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start your return?</h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                Provide your order details and we'll help you with the next steps for your return or exchange.
              </p>
              <Link href="/contact-us">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all tracking-wider text-sm"
                >
                  START RETURN REQUEST
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
