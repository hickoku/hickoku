"use client";

import { motion, Variants } from "framer-motion";
import { Mail, Clock, MapPin, Headphones, Phone, Instagram, Facebook, Twitter, Share2, ArrowLeft } from "lucide-react";
import { Header } from "../components/Header";
import Link from "next/link";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function ContactUsPage() {
  const contactDetails = [
    {
      icon: <Mail className="w-6 h-6 text-amber-600" />,
      title: "Email Us",
      content: (
        <>
          <p className="font-medium text-gray-900">support@hickoku.com</p>
          <p className="text-sm text-gray-500 mt-1">We usually respond within 24 business hours.</p>
        </>
      ),
      delay: 0.1
    },
    {
      icon: <Phone className="w-6 h-6 text-amber-600" />,
      title: "Call Us",
      content: (
        <>
          <p className="font-medium text-gray-900">+91 9360922878</p>
          <p className="text-sm text-gray-500 mt-1">Available during business hours.</p>
        </>
      ),
      delay: 0.2
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      title: "Business Hours",
      content: (
        <>
          <p className="font-medium text-gray-900">Monday – Friday</p>
          <p className="text-sm text-gray-500 mt-1">10:00 AM – 6:00 PM (IST)</p>
          <p className="font-medium text-gray-900">Saturday</p>
          <p className="text-sm text-gray-500 mt-1">10:00 AM – 4:00 PM (IST)</p>
        </>
      ),
      delay: 0.3
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber-600" />,
      title: "Location",
      content: (
        <>
          <p className="font-medium text-gray-900">Kamptee, Nagpur</p>
          <p className="text-sm text-gray-500 mt-1">Gujri Bazar, Kirana Market, Kamptee, Nagpur-441002, Maharashtra, India</p>
        </>
      ),
      delay: 0.4
    },
    {
      icon: <Headphones className="w-6 h-6 text-amber-600" />,
      title: "Support Scope",
      content: (
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          {/* <li>Account and access issues</li> */}
          <li>Technical support</li>
          <li>Order & delivery tracking</li>
          <li>Product inquiries</li>
        </ul>
      ),
      delay: 0.5
    },
    {
      icon: <Share2 className="w-6 h-6 text-amber-600" />,
      title: "Follow Us",
      content: (
        <div className="flex gap-4 mt-2">
          <a href="#" className="p-2 bg-amber-50 rounded-full text-amber-700 hover:bg-amber-100 hover:scale-110 transition-all duration-300">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="p-2 bg-amber-50 rounded-full text-amber-700 hover:bg-amber-100 hover:scale-110 transition-all duration-300">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="p-2 bg-amber-50 rounded-full text-amber-700 hover:bg-amber-100 hover:scale-110 transition-all duration-300">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      ),
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 overflow-hidden relative selection:bg-amber-500/20">
      <Header />
      
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 relative z-10">
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
            <span className="px-5 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold tracking-widest uppercase shadow-sm">
              Get In Touch
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeUpVariant}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 drop-shadow-sm"
          >
            We'd love to hear from <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">you.</span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariant}
            className="text-lg text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            Have a question, need help with an order, or looking for fragrance advice? Reach out and our team will get back to you as soon as possible.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {contactDetails.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { duration: 0.6, delay: item.delay, ease: "easeOut" } 
                  }
                }}
                whileHover={{ y: -5 }}
                className="relative p-6 rounded-3xl bg-white border border-gray-100/80 backdrop-blur-xl group transition-all duration-300 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex-1">
                    {item.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Embedded Google Map */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0, x: 40 },
              visible: { 
                opacity: 1, 
                x: 0, 
                transition: { duration: 0.8, delay: 0.4, ease: "easeOut" } 
              }
            }}
            className="relative h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100/80 bg-white p-2"
          >
            <div className="absolute inset-0 bg-amber-100/50 animate-pulse -z-10" />
            <iframe 
              src="https://maps.google.com/maps?q=Gujri%20Bazar%2C%20Kirana%20Market%2C%20Kamptee%2C%20Nagpur-441002%2C%20Maharashtra%2C%20India&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: "1.25rem" }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Hickoku Operations Map"
              className="grayscale-[30%] contrast-[1.1] hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
