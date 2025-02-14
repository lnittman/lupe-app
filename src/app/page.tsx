'use client';

import { ActionLog } from "@/components/home/action-log";
import { SongSelection } from "@/components/home/song-selection";
import { StemPlayer } from "@/components/home/stem-player";
import { Menu } from "@/components/menu";
import { useAudioStore } from "@/store";

export default function HomePage() {
  const { stems, isLoading } = useAudioStore();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Menu />
      <ActionLog />

      {!stems && <SongSelection />}
      {stems && !isLoading && <StemPlayer />}
    </div>
  );
} 
