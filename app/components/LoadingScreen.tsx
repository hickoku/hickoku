"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onLoadingComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden"
    >
      {/* Animated particles/mist effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 2,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [0, 0.5, 0],
              scale: [null, Math.random() * 3],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center">
        {/* Perfume bottle icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <svg
            width="80"
            height="120"
            viewBox="0 0 80 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
          >
            {/* Bottle cap */}
            <motion.rect
              x="30"
              y="10"
              width="20"
              height="15"
              rx="2"
              fill="url(#gradient1)"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            {/* Bottle neck */}
            <motion.path
              d="M 32 25 L 32 40 L 20 45 L 20 100 C 20 105 25 110 30 110 L 50 110 C 55 110 60 105 60 100 L 60 45 L 48 40 L 48 25 Z"
              fill="url(#gradient2)"
              stroke="white"
              strokeWidth="1"
              strokeOpacity="0.3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            />
            {/* Liquid inside */}
            <motion.path
              d="M 22 50 L 22 100 C 22 104 26 108 30 108 L 50 108 C 54 108 58 104 58 100 L 58 50 Z"
              fill="url(#liquidGradient)"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              style={{ transformOrigin: "bottom" }}
            />
            {/* Perfume mist */}
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx="40"
                cy="10"
                r="3"
                fill="white"
                opacity="0.6"
                initial={{ y: 0, opacity: 0.6, scale: 0.5 }}
                animate={{
                  y: -30 - i * 10,
                  opacity: 0,
                  scale: 2,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
            <defs>
              <linearGradient id="gradient1" x1="30" y1="10" x2="50" y2="25">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA8C2C" />
              </linearGradient>
              <linearGradient id="gradient2" x1="20" y1="25" x2="60" y2="110">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
              </linearGradient>
              <linearGradient
                id="liquidGradient"
                x1="22"
                y1="50"
                x2="58"
                y2="110"
              >
                <stop offset="0%" stopColor="#DFE5DB" />
                <stop offset="100%" stopColor="#C7D3BE" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-5xl text-white tracking-[0.3em] mb-4"
        >
          HK
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-white/70 tracking-widest text-sm uppercase mb-8"
        >
          Crafting Elegance
        </motion.p>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-[1px] bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#DFE5DB] to-white"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-white/50 text-xs mt-2 tracking-wider"
          >
            {progress}%
          </motion.p>
        </div>
      </div>

      {/* Ambient glow effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#DFE5DB]/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
