'use client';

import { motion } from "framer-motion";

export function SongLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-sm text-neutral-500 font-mono inline-flex items-center justify-center">
            loading songs
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                times: [0, 0.5, 1]
              }}
            >
              ...
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 