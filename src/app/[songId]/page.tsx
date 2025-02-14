'use client';

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { StemPlayer } from "@/components/home/stem-player";
import { SplitLoader } from "@/components/home/song-selection/components/split-loader";
import { Instructions } from "@/components/instructions";
import { useAudioStore } from "@/store";

export default function SongPage() {
  const { songId } = useParams();
  const { stems, isLoading, showInstructions, initializeEngine, setStems, setIsLoading } = useAudioStore();

  // Show loader immediately on mount
  useEffect(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  // Load song data
  useEffect(() => {
    const loadSong = async () => {
      try {
        const response = await fetch(`/api/songs/${songId}`);
        if (!response.ok) throw new Error('Song not found');
        
        const song = await response.json();
        
        // Initialize engine and load stems
        await initializeEngine();
        await setStems(song.stems);
      } catch (error) {
        console.error('Failed to load song:', error);
        // Could redirect to home or show error state
      } finally {
        setIsLoading(false);
      }
    };

    if (songId) {
      loadSong();
    }
  }, [songId, initializeEngine, setStems, setIsLoading]);

  return (
    <div className="flex flex-col min-h-screen">
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <SplitLoader />
        </div>
      )}
      {stems && !isLoading && (
        <>
          {showInstructions ? <Instructions /> : <StemPlayer />}
        </>
      )}
    </div>
  );
} 