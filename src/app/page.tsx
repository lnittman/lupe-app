'use client';

import { SongSelection } from "@/components/home/song-selection";
import { Instructions } from "@/components/instructions";
import { useAudioStore } from "@/store";

export default function HomePage() {
  const { showInstructions } = useAudioStore();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        {showInstructions ? <Instructions /> : <SongSelection />}
      </div>
    </div>
  );
} 
