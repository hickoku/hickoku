"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles, Globe, Gem, Star, Crown } from "lucide-react";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function WhyChooseUsPage() {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-amber-600" />,
      title: "Unparalleled Craftsmanship",
      description: "Each Hickoku perfume is a masterpiece, carefully curated by expert perfumers who understand the delicate balance between elegance and intensity. Every drop is a testament to our commitment to sophistication and excellence.",
      delay: 0.1
    },
    {
      icon: <Globe className="w-8 h-8 text-amber-600" />,
      title: "The Finest Ingredients",
      description: "We search the world for the purest and most luxurious essences—from hand-picked jasmine in Grasse to rare oud from the Middle East. Our fragrances are a blend of tradition and innovation, ensuring both quality and sustainability.",
      delay: 0.2
    },
    {
      icon: <Gem className="w-8 h-8 text-amber-600" />,
      title: "Timeless Elegance",
      description: "Our perfumes are more than just scents—they are an expression of identity. Whether bold and daring or soft and romantic, each fragrance is designed to complement your unique personality and style.",
      delay: 0.3
    },
    {
      icon: <Star className="w-8 h-8 text-amber-600" />,
      title: "Long-Lasting & Exquisite",
      description: "Hickoku perfumes are formulated with the highest concentration of pure oils, ensuring a fragrance that lasts from day to night, leaving a trail of luxury wherever you go.",
      delay: 0.4
    },
    {
      icon: <Crown className="w-8 h-8 text-amber-600" />,
      title: "A Symbol of Prestige",
      description: "Choosing Hickoku means choosing exclusivity. Our limited-edition fragrances and bespoke creations are designed for those who appreciate the finer things in life—where luxury isn’t just a choice, but a way of being.",
      delay: 0.5
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-hidden relative selection:bg-amber-500/20">
      {/* Absolute Ambient Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-400/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[30%] bg-orange-400/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <motion.div variants={fadeUpVariant} className="flex justify-center mb-6">
            <span className="px-5 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold tracking-widest uppercase shadow-sm">
              Our Philosophy
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeUpVariant}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 drop-shadow-sm"
          >
            Crafting Experiences,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Transcending Time.</span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariant}
            className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-3xl mx-auto"
          >
            At Hickoku Perfumes, we don’t just create fragrances—we craft experiences, blending artistry with the rarest ingredients to bring you scents that transcend time. Every bottle tells a story, every note awakens an emotion, and every fragrance is designed to leave an unforgettable impression.
          </motion.p>
        </motion.div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 xl:gap-8">
          {features.map((feature, index) => {
            // Adjust layout for a purely aesthetic asymmetrical grid
            let spanClass = "col-span-1 md:col-span-1 lg:col-span-2"; // default (3 cols)
            if (index === 0) spanClass = "col-span-1 md:col-span-2 lg:col-span-4"; 
            if (index === 1) spanClass = "col-span-1 md:col-span-1 lg:col-span-2"; 
            if (index === 2) spanClass = "col-span-1 md:col-span-1 lg:col-span-2"; 
            if (index === 3) spanClass = "col-span-1 md:col-span-1 lg:col-span-2"; 
            if (index === 4) spanClass = "col-span-1 md:col-span-2 lg:col-span-2"; 

            return (
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
                    transition: { duration: 0.7, delay: feature.delay, ease: [0.22, 1, 0.36, 1] } 
                  }
                }}
                whileHover={{ y: -5 }}
                className={`relative p-8 md:p-10 rounded-[2rem] bg-white border border-gray-100/80 backdrop-blur-xl group transition-all duration-500 overflow-hidden ${spanClass} shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200`}
              >
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem]" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 group-hover:text-amber-800 transition-colors duration-500 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-500 text-lg flex-1">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative floating blurred circle matched to icon */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.6 } }
          }}
          className="mt-24 text-center"
        >
          <div className="inline-block p-[1.5px] rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <a href="/collection" className="block px-10 py-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-50 transition-colors duration-300">
              Discover Our Collections
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
