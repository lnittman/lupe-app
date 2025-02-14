'use client';

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

export function Instructions() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-lg mx-auto p-6 space-y-8 font-mono text-sm"
    >
      <h2 className="font-bold text-base">controls</h2>
      
      {/* Stem Track Demo */}
      <section className="space-y-4">
        <h3 className="font-bold">stem</h3>
        <div className="h-[52px] w-full bg-white border border-black flex items-stretch">
          <button className="w-8 md:w-12 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center px-3">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-1">
                <span className="text-xs tracking-tight w-12">vocals</span>
              </div>
              <div className="flex gap-0.5 flex-1 h-[32px]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-full flex-1 bg-black/5" />
                ))}
              </div>
              <span className="text-[10px] px-1">32</span>
            </div>
          </div>
          <button className="w-8 md:w-12 flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <ul className="space-y-2 text-xs">
          <li>• click stem name to mute/unmute</li>
          <li>• left/right arrows adjust loop position</li>
          <li>• number on right adjusts loop length (4, 8, 16, or 32 beats)</li>
          <li>• grid shows current loop region</li>
        </ul>
      </section>

      {/* Player Controls Demo */}
      <section className="space-y-4">
        <h3 className="font-bold">playback</h3>
        <div className="border border-black p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <button className="h-8 w-24 bg-black text-white flex items-center justify-center font-mono text-sm">
                play
              </button>
              <button className="h-8 w-24 bg-black text-white flex items-center justify-center font-mono text-sm">
                stop
              </button>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col gap-1">
                <div className="h-8 w-24 border border-black flex items-center justify-center text-sm">
                  120
                </div>
                <div className="flex h-8">
                  <button className="flex-1 h-full flex items-center justify-center border border-black">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button className="flex-1 h-full flex items-center justify-center border-t border-r border-b border-black">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button className="h-8 w-24 bg-black text-white text-sm font-mono">
                  tap
                </button>
                <button className="h-8 w-24 bg-black text-white text-sm font-mono">
                  1x
                </button>
              </div>
            </div>
          </div>
          <ul className="text-xs space-y-2">
            <li>• play/stop: control playback</li>
            <li>• bpm: adjust tempo with arrows or tap button</li>
            <li>• speed: click rate button to cycle through playback speeds (0.25x - 2x)</li>
          </ul>
        </div>
      </section>
    </motion.div>
  );
} 

export default Instructions;