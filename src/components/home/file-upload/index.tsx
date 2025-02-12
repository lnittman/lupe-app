'use client';

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRef } from "react";

import { useToast } from "@/hooks/use-toast";
import { useAudioStore } from "@/lib/store";

import { SplitLoader } from "./components/split-loader";

export function FileUpload() {
  const { toast } = useToast(); 

  const { isLoading, processAudioFile, setIsLoading, setSplitProgress } = useAudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    try {
      await processAudioFile(file);
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process audio file",
        variant: "destructive",
      });

      setIsLoading(false);
      setSplitProgress(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0];
    if (file) handleFile(file);
  };

  const openFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {!isLoading && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
            onClick={openFileUpload}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onPaste={handlePaste}
          >
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto border border-black flex items-center justify-center [border-radius:0]">
                <Plus className="w-8 h-8" />
              </div>

              <p className="text-sm text-neutral-500 tracking-tight">
                tap or drop audio to begin
              </p>
            </div>
          </motion.div>
        </>
      )}

      {isLoading && <SplitLoader />}
    </>
  );
} 