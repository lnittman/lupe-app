'use client';

import { useAudioStore } from '@/store';
import { SystemActionType } from '@/types/action';

export function Menu() {
  const { stems, setStems, engine, addAction } = useAudioStore();

  const handleExit = () => {
    if (engine) {
      // Just clear stems - this will handle stopping playback
      setStems(null);
      // Log exit action
      addAction({
        id: crypto.randomUUID(),
        type: SystemActionType.Exited,
        timestamp: Date.now()
      });
    }
  };

  if (!stems) return null;

  return (
    <div className="fixed top-0 right-0 p-4 z-50">
      <button 
        onClick={handleExit}
        className="h-8 w-24 bg-black text-white flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/90 font-mono text-[10px]"
      >
        exit
      </button>
    </div>
  );
} 