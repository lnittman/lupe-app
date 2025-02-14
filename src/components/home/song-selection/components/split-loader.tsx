'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { useAudioStore } from "@/store";
import { StemType } from "@/types/audio";

export function SplitLoader() {
  const { SplitProgress, stems, setIsLoading } = useAudioStore();

  const [dots, setDots] = useState('');
  const [fakeProgress, setFakeProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Start the animation immediately on mount
  useEffect(() => {
    let dotsInterval: number;
    let progressInterval: number;

    const startAnimation = () => {
      setIsAnimating(true);
      setFakeProgress(0);
      setDots('');

      // Dots animation
      dotsInterval = window.setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);

      // Progress animation
      let currentStep = 0;
      const totalSteps = 180; // Doubled the steps
      const baseStep = 0.005; // Halved the base step

      progressInterval = window.setInterval(() => {
        if (currentStep < totalSteps) {
          currentStep++;
          setFakeProgress(prev => {
            const increment = baseStep + (Math.random() * 0.002); // Smaller random variation
            return Math.min(0.9, prev + increment);
          });
        }
      }, 150); // Slightly longer interval
    };

    startAnimation();

    return () => {
      window.clearInterval(dotsInterval);
      window.clearInterval(progressInterval);
    };
  }, []);

  // Handle completion when stems are loaded
  useEffect(() => {
    if (stems && Object.keys(stems).length > 0 && isAnimating) {
      setIsAnimating(false);
      setFakeProgress(1);
      
      // Small delay before removing loader
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [stems, isAnimating, setIsLoading]);

  const progress = SplitProgress?.progress ?? fakeProgress;
  const progressPercent = Math.round(progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <div className="text-xs text-neutral-400 font-mono">{progressPercent}%</div>

          <div className="relative h-1 bg-neutral-100 overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Object.values(StemType).map((stem) => (
              <div 
                key={stem}
                className={`text-xs font-mono p-2 border rounded-none transition-colors ${
                  SplitProgress?.currentStem === stem 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black'
                }`}
              >
                {stem}
              </div>
            ))}
          </div>

          <div className="text-sm text-neutral-500 font-mono inline-flex items-center justify-center w-full">
            splitting stems
            <span className="inline-flex items-center ml-[1px]">
              {'.'.repeat(3).split('').map((dot, i) => (
                <span 
                  key={i} 
                  className="opacity-0 transition-opacity duration-150 w-[1ch] text-center"
                  style={{ 
                    opacity: dots.length > i ? 1 : 0 
                  }}
                >
                  .
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 