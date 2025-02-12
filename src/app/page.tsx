'use client';

import { AnimatePresence } from "framer-motion";

import { ActionLog } from "@/components/home/action-log";
import { FileUpload } from "@/components/home/file-upload";
import { StemPlayer } from "@/components/home/stem-player";
import { useAudioStore } from "@/store";

export default function HomePage() {
  const { file, isLoading, stems } = useAudioStore();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <ActionLog />

      <AnimatePresence mode="sync">
        {!file && <FileUpload />}
        {stems && !isLoading && <StemPlayer />}
      </AnimatePresence>
    </div>
  );
} 
