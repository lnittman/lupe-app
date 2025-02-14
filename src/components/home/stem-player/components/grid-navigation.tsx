import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAudioStore } from '@/store';
import { StemType } from "@/types/audio";

export function GridNavigation() {
  const { 
    stems, 
    gridViewOffset, 
    setGridViewOffset, 
    updateStem 
  } = useAudioStore();

  const handleGridNavigation = (direction: -1 | 1) => {
    const newOffset = Math.max(0, gridViewOffset + direction);
    setGridViewOffset(newOffset);

    // Update all stem loop positions
    Object.entries(stems || {}).forEach(([name, stem]) => {
      const currentStart = stem.loopStart || 0;
      const newStart = currentStart + (direction * 32);
      if (newStart >= 0) {
        updateStem(name as StemType, { loopStart: newStart });
      }
    });
  };

  return (
    <div className="flex items-stretch h-[52px] mb-2 border border-black">
      <button
        onClick={() => handleGridNavigation(-1)}
        disabled={gridViewOffset === 0}
        className="w-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex-1 p-4" />
      <button
        onClick={() => handleGridNavigation(1)}
        className="w-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
} 