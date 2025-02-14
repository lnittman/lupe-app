'use client';

import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

import { useAudioStore } from "@/store";
import { FileUpload } from "./components/file-upload";
import { SongLoader } from "./components/song-loader";
import { toast } from "@/hooks/use-toast";
import { fetcher } from "@/lib/api/client";
import type { RecentSong } from "@/types/api";

export function SongSelection() {
  const router = useRouter();
  const { initializeEngine, setIsLoading } = useAudioStore();
  const [isClient, setIsClient] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Add loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch songs with SWR
  const { data, error, isLoading, mutate } = useSWR('/api/songs', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSongSelect = async (song: RecentSong) => {
    router.push(`/${song.id}`);
  };

  const handleDelete = async (songId: string) => {
    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Revalidate songs data
      await mutate();

      toast({
        title: 'Success',
        description: 'Song deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete song',
        variant: 'destructive'
      });
    }
  };

  const isLocalhost = isClient && window.location.hostname === 'localhost';

  if (showUpload) {
    return <FileUpload onCancel={() => setShowUpload(false)} />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full px-3"
      >
        <div className="max-w-md mx-auto w-full space-y-5">
          <p className="text-sm text-red-500 text-center">
            Failed to load songs
          </p>
        </div>
      </motion.div>
    );
  }

  if (isLoading && showLoader) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <SongLoader />
      </div>
    );
  }

  const songs = data?.songs || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full px-3"
    >
      <div className="max-w-md mx-auto w-full space-y-5">
        <h2 className="text-xl font-mono text-center">
          select a song to remix
        </h2>
        
        {isLocalhost && (
          <button
            onClick={() => setShowUpload(true)}
            className="w-full p-4 border border-black hover:bg-black/5 transition-colors font-mono flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            add song
          </button>
        )}

        {songs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-mono text-neutral-500 pb-2">recent songs</h3>
            {songs.map((song) => (
              <div key={song.id} className="relative">
                <button
                  onClick={() => handleSongSelect(song)}
                  className="w-full p-4 border border-black hover:bg-black/5 transition-colors font-mono text-left"
                >
                  <div className="text-left">
                    <div>{song.title.toLowerCase()}</div>
                    <div className="text-sm text-neutral-500">
                      {new Date(song.date).toLocaleDateString()}
                    </div>
                  </div>
                </button>
                
                {isLocalhost && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(song.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && songs.length === 0 && (
          <p className="text-sm font-mono text-neutral-500 text-center">
            no songs available - {isLocalhost ? 'add one to get started' : 'check back soon'}
          </p>
        )}
      </div>
    </motion.div>
  );
}