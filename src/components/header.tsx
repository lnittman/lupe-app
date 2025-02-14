'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { audioBufferToWav } from '@/lib/audio/utils';
import { SystemActionType } from '@/types/action';
import { useAudioStore } from '@/store';

export function Header() {
  const router = useRouter();
  const { 
    engine, 
    stems, 
    addAction,
    setPlaybackRate, 
    setStems,
    showInstructions,
    setShowInstructions 
  } = useAudioStore();

  const handleExit = () => {
    if (engine) {
      // Stop playback and clear stems
      engine.stopPlayback();
      setStems(null);
      
      // Reset playback rate to 1x
      setPlaybackRate(1);
      
      // Log exit action
      addAction({
        id: crypto.randomUUID(),
        type: SystemActionType.Exited,
        timestamp: Date.now()
      });

      // Navigate back to home
      router.push('/');
    }
  };

  const handleViewInstructions = () => {
    setShowInstructions(true);
  };

  const handleDownloadStems = async () => {
    if (!stems || !engine) return;

    try {
      // Create a zip file containing all stems
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add each stem to the zip
      Object.entries(stems).forEach(([name, stem]) => {
        if (stem.buffer) {
          // Convert AudioBuffer to WAV format
          const wavArrayBuffer = audioBufferToWav(stem.buffer);
          zip.file(`${name}.wav`, wavArrayBuffer);
        }
      });

      // Generate and download the zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stems.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download stems:', error);
    }
  };

  const handleDownloadMix = async () => {
    if (!stems || !engine) return;

    try {
      // Export the current mix
      const mixBuffer = await engine.exportMix();
      
      // Convert to WAV
      const wavArrayBuffer = audioBufferToWav(mixBuffer);
      
      // Download
      const blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mix.wav';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download mix:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50">
      {/* Left: Back button or empty space */}
      <div className="w-8">
        <AnimatePresence>
          {(stems && !showInstructions) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleExit}
              className="h-8 w-8 border border-black flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
          {showInstructions && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstructions(false)}
              className="h-8 w-8 border border-black flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Center: Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8">
        <Image
          src="/assets/logo.png"
          alt="Lupe"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Right: Menu */}
      <AnimatePresence>
        {!showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 border border-black flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/5">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {stems ? (
                  <>
                    <DropdownMenuItem onClick={handleDownloadMix} className="text-sm">
                      download mix
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadStems} className="text-sm">
                      download stems
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuItem 
                  onClick={handleViewInstructions}
                  className="text-sm"
                >
                  view instructions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 