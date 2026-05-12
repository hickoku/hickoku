"use client";

import { motion } from "motion/react";
import { HandIcon, Sparkles, Wind } from "lucide-react";

export default function HowToUse() {
  const steps = [
    {
      id: "01",
      title: "Dab & Apply",
      description: "Apply a small drop of oil onto your inner wrists or palm using the glass applicator.",
      icon: <HandIcon className="w-8 h-8 text-amber-500" />,
      detail: "Less is more with concentrated oils."
    },
    {
      id: "02",
      title: "Pulse Points",
      description: "Gently transfer the fragrance to other pulse points like behind the ears and neck.",
      icon: <Sparkles className="w-8 h-8 text-rose-500" />,
      detail: "Heat from pulse points helps the scent bloom."
    },
    {
      id: "03",
      title: "Let it Settle",
      description: "Avoid rubbing vigorously. Allow the oil to absorb naturally into your skin.",
      icon: <Wind className="w-8 h-8 text-blue-500" />,
      detail: "This preserves the complex scent molecules."
    }
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl font-light tracking-tight text-gray-900 sm:text-4xl">
            How to <span className="font-bold">Use</span>
          </h2>
          <div className="mt-4 flex justify-center">
            <div className="h-1 w-12 bg-amber-500 rounded-full" />
          </div>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Experience the true essence of luxury. Attar and oil-based perfumes are concentrated and react with your body heat for longevity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group relative"
            >
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-amber-100 rounded-full scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                    {step.icon}
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                    {step.id}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-[240px] mb-4">
                  {step.description}
                </p>
                <div className="h-px w-8 bg-gray-200 group-hover:w-16 transition-all duration-500 mb-4" />
                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
