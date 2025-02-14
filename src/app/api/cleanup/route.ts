import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { del } from '@vercel/blob';

// Helper to get blob config
const getBlobConfig = () => {
  const token = process.env.LUPE_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('LUPE_BLOB_READ_WRITE_TOKEN environment variable is not set');
  }
  return { token };
};

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();
    
    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Get song metadata first
    const song = await kv.get(`song:${songId}`) as {
      id: string;
      title: string;
      date: string;
      stems: Record<string, string>;
    };

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Get blob config
    const blobConfig = getBlobConfig();

    // Delete from KV
    await kv.del(`song:${songId}`);
    await kv.zrem('songs', songId);

    // Delete stem files from blob storage
    if (song.stems) {
      const deletePromises = Object.values(song.stems).map(async (url: string) => {
        try {
          await del(url, blobConfig);
        } catch (error) {
          console.warn(`Failed to delete blob: ${url}`, error);
        }
      });
      await Promise.all(deletePromises);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Song deleted successfully'
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}