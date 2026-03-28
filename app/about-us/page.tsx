"use client";

import { motion, Variants } from "framer-motion";
import { BookOpen, Sparkles, Feather } from "lucide-react";
import { Header } from "../components/Header";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function AboutUsPage() {
  const sections = [
    {
      icon: <BookOpen className="w-8 h-8 text-amber-600" />,
      title: "Our Story",
      description: "Hickoku was born from the belief that fragrance should feel personal, intimate, and emotionally connected. Rather than following loud trends, Hickoku focuses on subtle luxury, soulful storytelling, and refined simplicity. Each fragrance is carefully curated to evoke a feeling — comfort, romance, serenity, confidence, or mystery — allowing the wearer to form a deep emotional bond with their scent.",
      delay: 0.1
    },
    {
      icon: <Sparkles className="w-8 h-8 text-amber-600" />,
      title: "Our Philosophy",
      description: "We believe fragrance is an extension of self. Our creations are designed to sit close to the skin, evolving gently throughout the day without overpowering the senses. Hickoku fragrances are crafted to feel natural, expressive, and timeless.",
      delay: 0.2
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-hidden relative selection:bg-amber-500/20">
      <Header />
      
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-amber-400/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUpVariant} className="flex justify-center mb-6">
            <span className="px-5 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold tracking-widest uppercase shadow-sm">
              About HICKOKU
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeUpVariant}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-gray-900 drop-shadow-sm"
          >
            A Fragrance House Built on <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Emotion.</span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariant}
            className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            Hickoku Perfume is a contemporary fragrance brand dedicated to crafting scents that speak to emotion, memory, and individuality. Each creation is designed to blend seamlessly into everyday life while still leaving a lasting impression.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { duration: 0.7, delay: section.delay, ease: [0.22, 1, 0.36, 1] } 
                }
              }}
              whileHover={{ y: -5 }}
              className="relative p-8 md:p-12 rounded-[2rem] bg-white border border-gray-100/80 backdrop-blur-xl group transition-all duration-500 overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem]" />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 shadow-sm">
                  {section.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 group-hover:text-amber-800 transition-colors duration-500 tracking-tight">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-500 text-lg flex-1">
                  {section.description}
                </p>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
