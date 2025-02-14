'use client';

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { useAudioStore } from "@/store";
import { FileUpload } from "./components/file-upload";
import { SongLoader } from "./components/song-loader";
import { toast } from "@/hooks/use-toast";

interface RecentSong {
  id: string;
  title: string;
  date: string;
  stems: Record<string, string>;
}

export function SongSelection() {
  const { initializeEngine, setIsLoading, setStems } = useAudioStore();

  const [isClient, setIsClient] = useState(false);
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isSongsLoading, setIsSongsLoading] = useState(true);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/songs');
        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        setRecentSongs(data.songs);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsSongsLoading(false);
      }
    };

    if (isClient) {
      fetchSongs();
    }
  }, [isClient]);

  const handleSongSelect = async (song: RecentSong) => {
    console.log('Selecting song:', song);
    setIsLoading(true);
    
    try {
      // Initialize engine first
      await initializeEngine();
      console.log('Engine initialized');
  
      // Load and decode each stem
      console.log('Loading stems:', Object.entries(song.stems));
      const stemBuffers = await Promise.all(
        Object.entries(song.stems).map(async ([name, url]) => {
          console.log(`Fetching stem: ${name} from ${url}`);
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to fetch stem ${name}: ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Decoding stem: ${name}`);
          
          const audioContext = new (window.AudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          console.log(`Successfully loaded stem: ${name}`);

          return [name, audioBuffer];
        })
      );
  
      const stems = Object.fromEntries(stemBuffers);
      console.log('All stems loaded:', Object.keys(stems));
  
      // Set stems in store
      setStems(stems);
    } catch (error) {
      console.error('Failed to load stems:', error);
      toast({
        title: 'Error',
        description: 'Failed to load song stems',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showUpload) {
    return <FileUpload onCancel={() => setShowUpload(false)} />;
  }

  if (isSongsLoading) {
    return <SongLoader />;
  }

  const isLocalhost = isClient && window.location.hostname === 'localhost';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center px-3"
    >
      <div className="max-w-md w-full space-y-5">
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

        {recentSongs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-mono text-neutral-500 pb-2">recent songs</h3>
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSongSelect(song)}
                className="w-full p-4 border border-black hover:bg-black/5 transition-colors font-mono"
              >
                <div className="text-left">
                  <div>{song.title.toLowerCase()}</div>
                  <div className="text-sm text-neutral-500">
                    {new Date(song.date).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!isSongsLoading && !recentSongs.length && (
          <p className="text-sm font-mono text-neutral-500 text-center">
            no songs available - {isLocalhost ? 'add one to get started' : 'check back soon'}
          </p>
        )}
      </div>
    </motion.div>
  );
}