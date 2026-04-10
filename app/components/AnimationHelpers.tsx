import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70"
    >
      <Sparkles className="w-6 h-6 animate-pulse" />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-xs tracking-widest uppercase"
      >
        Scroll to Explore
      </motion.div>
      <motion.div
        animate={{ scaleY: [1, 1.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-px h-8 bg-white/50"
      />
    </motion.div>
  );
}

export function ParallaxImage({ src, alt, speed = 0.5 }: { src: string; alt: string; speed?: number }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div style={{ y }} className="absolute inset-0">
      <Image src={src} alt={alt} fill className="object-cover" />
    </motion.div>
  );
}
