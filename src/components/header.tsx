'use client';

import Image from 'next/image';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useAudioStore } from '@/store';
import { SystemActionType } from '@/types/action';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = numOfChan * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = length;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numOfChan, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Write the PCM samples
  const offset = 44;
  let pos = offset;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      // Clamp between -1 and 1
      const clampedSample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const int16 = clampedSample < 0 
        ? clampedSample * 0x8000 
        : clampedSample * 0x7FFF;
      view.setInt16(pos, int16, true);
      pos += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function Header() {
  const { 
    stems, 
    setStems, 
    engine, 
    addAction,
    setPlaybackRate 
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
    }
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
      {/* Left: Back button */}
      {stems && (
        <button 
          onClick={handleExit}
          className="h-8 w-8 border border-black flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/5"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

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
      {stems && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 border border-black flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/5">
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleDownloadMix} className="text-sm">
              download mix
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadStems} className="text-sm">
              download stems
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
} 