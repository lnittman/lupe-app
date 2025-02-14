import { NextResponse } from 'next/server';

import { kv } from '@vercel/kv';

import { Song } from '@/types/api';

export async function GET() {
  try {
    // Get the last 5 song IDs from the sorted set
    const songIds = await kv.zrange('songs', 0, 4, { rev: true });
    
    // Get the metadata for each song
    const songs = await Promise.all(
      songIds.map(async (id) => {
        try {
          const song = await kv.get(`song:${id}`);
          if (!song) {
            console.warn(`No metadata found for song: ${id}`);
            // Remove invalid ID from sorted set
            await kv.zrem('songs', id);
            return null;
          }
          return song;
        } catch (error) {
          console.error(`Error fetching song ${id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and invalid songs
    const validSongs = songs.filter((song): song is Song => {
      return song !== null && 
             typeof song === 'object' &&
             'id' in song &&
             'title' in song &&
             'date' in song &&
             'stems' in song;
    });

    return NextResponse.json({ songs: validSongs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 