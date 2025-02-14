import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST() {
  try {
    // Get all song IDs
    const songIds = await kv.zrange('songs', 0, -1);
    
    // Check each song and remove invalid ones
    const cleanupPromises = songIds.map(async (id) => {
      const song = await kv.get(`song:${id}`);
      if (!song) {
        console.log(`Removing invalid song: ${id}`);
        await kv.zrem('songs', id);
        await kv.del(`song:${id}`);
        return id;
      }
      return null;
    });

    const removedIds = (await Promise.all(cleanupPromises)).filter(Boolean);
    
    return NextResponse.json({ 
      success: true, 
      removed: removedIds 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 