import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(
  request: Request,
  { params }: { params: { songId: string } }
) {
  try {
    const song = await kv.get(`song:${params.songId}`);
    
    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 