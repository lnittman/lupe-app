'use client';

import { motion } from "framer-motion";
import { useRef } from "react";

import { useToast } from "@/hooks/use-toast";
import { useAudioStore } from "@/store";

import { SplitLoader } from "./split-loader";

const SquarePlus = ({ className }: { className?: string }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="1"
    className={className}
  >
    <path d="M12 5V19" strokeLinecap="square" />
    <path d="M5 12H19" strokeLinecap="square" />
  </svg>
);

interface FileUploadProps {
  onCancel?: () => void;
}

export function FileUpload({ onCancel }: FileUploadProps) {
  const { toast } = useToast(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, setIsLoading, initializeEngine } = useAudioStore();

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true);
      await initializeEngine();

      // Create song info
      const songInfo = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        date: new Date().toISOString(),
        stems: {}
      };

      toast({
        title: "Processing",
        description: "Separating stems...",
      });

      // First send to backend for separation
      const formData = new FormData();
      formData.append('file', file);

      const backendResponse = await fetch('http://localhost:8000/api/separate', {
        method: 'POST',
        body: formData
      });

      if (!backendResponse.ok) {
        throw new Error('Failed to process file');
      }

      const backendData = await backendResponse.json();
      console.log('Backend response:', backendData);

      if (!backendData.stems || !Array.isArray(backendData.stems)) {
        throw new Error('Invalid stems data received from backend');
      }

      toast({
        title: "Uploading",
        description: "Saving stems...",
      });

      // Then save to KV/blob storage
      const response = await fetch('/api/stems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songInfo,
          stems: backendData.stems
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save stems: ${error}`);
      }

      const result = await response.json();
      console.log('Stems API response:', result);
      
      // Handle successful upload
      toast({
        title: "Success!",
        description: "Your song has been processed and saved.",
      });

      // Refresh the page to show new song
      window.location.reload();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
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
            capture={false}
            multiple={false}
            x-webkit-speech=""
            x-webkit-grammar="bounding-box"
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
                <SquarePlus />
              </div>

              <div className="space-y-2 font-mono">
                <p className="text-sm text-neutral-500 tracking-tight">
                  tap or drop audio file
                </p>
                {onCancel && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel();
                    }}
                    className="text-sm text-neutral-500 hover:text-black"
                  >
                    cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {isLoading && <SplitLoader />}
    </>
  );
}

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function handleUpload(file: File) {
  try {
    // Create song info
    const songInfo = {
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      date: new Date().toISOString(),
      stems: {}
    };

    // Convert file to base64 for transport
    const fileData = await fileToBase64(file);

    // Send to stems API
    const response = await fetch('/api/stems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: fileData,
        songInfo
      })
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
} 