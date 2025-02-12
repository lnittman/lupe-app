'use client';

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import { useAudioStore } from "@/store";
import { StemType } from "@/types/audio";

export function SplitLoader() {
  const { SplitProgress, stems, setIsLoading } = useAudioStore();

  const completedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const dotsIntervalRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const [dots, setDots] = useState('');
  const [fakeProgress, setFakeProgress] = useState(0);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    setDots('');
    setFakeProgress(0);

    dotsIntervalRef.current = window.setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const progressSteps = Array.from({ length: 90 }, (_, i) => {
      const baseStep = 0.005;
      const randomVariation = Math.random() * 0.005 - 0.0025;

      return baseStep + randomVariation;
    });

    let currentStep = 0;

    progressIntervalRef.current = window.setInterval(() => {
      setFakeProgress(prev => {
        if (currentStep >= progressSteps.length) return prev;
        const nextProgress = prev + progressSteps[currentStep++];
        return Math.min(0.9, nextProgress);
      });
    }, 200);

    return () => {
      if (dotsIntervalRef.current) window.clearInterval(dotsIntervalRef.current);
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (stems && Object.keys(stems).length > 0 && !completedRef.current) {
      console.log('stems arrived');
      console.log(stems);

      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
      if (dotsIntervalRef.current) window.clearInterval(dotsIntervalRef.current);
      
      completedRef.current = true;
      
      setFakeProgress(1);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [stems]);

  const progress = SplitProgress?.progress ?? fakeProgress;
  const progressPercent = Math.round(progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-xs text-neutral-400 font-mono">{progressPercent}%</div>

          <div className="relative h-1 bg-neutral-100 overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
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

          <div className="text-sm text-neutral-500 inline-flex items-center justify-center">
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