import { NextResponse } from 'next/server';

import { put, list } from '@vercel/blob';
import { kv } from '@vercel/kv';

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { StemType } from '@/types/audio';

// Configure blob client with environment variable
const blobConfig = {
  token: process.env.BLOB_READ_WRITE_TOKEN
};

if (!blobConfig.token) {
  throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
}

interface SongMetadata {
  id: string;
  title: string;
  date: string;
  stems: Record<StemType, string>;
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Blob storage is not configured' },
      { status: 500 }
    );
  }

  console.log('api/stems POST started');
  
  try {
    const { file: fileData, songInfo } = await request.json();
    console.log('Processing file for:', songInfo.title);

    // Convert base64 to form data
    const formData = new FormData();
    const blob = await fetch(fileData).then(r => r.blob());
    formData.append('file', blob, songInfo.title + '.wav');

    // Send to separation backend
    console.log('Sending to separation backend...');
    const separationResponse = await fetch(API_ENDPOINTS.SEPARATE, {
      method: 'POST',
      body: formData
    });

    if (!separationResponse.ok) {
      throw new Error(`Separation failed: ${separationResponse.statusText}`);
    }

    // Process stems and store in Vercel Blob
    const responseData = await separationResponse.json();
    console.log('Received response from backend:', responseData);

    const { stems } = responseData;
    if (!stems || !Array.isArray(stems)) {
      throw new Error('Invalid stems data received from backend');
    }

    console.log('Processing stems:', stems.map(s => s.name));

    // Store metadata in Vercel KV
    const metadata: SongMetadata = {
      id: songInfo.id,
      title: songInfo.title,
      date: songInfo.date,
      stems: {} as Record<StemType, string>
    };

    // Upload each stem to Vercel Blob
    for (const stem of stems) {
      console.log(`Processing stem: ${stem.name}`);
      const blobResponse = await put(
        `${songInfo.id}/${stem.name}.wav`,
        Buffer.from(stem.data, 'base64'),
        { 
          access: 'public',
          addRandomSuffix: false
        }
      );
      console.log(`Uploaded ${stem.name} to blob:`, blobResponse.url);
      metadata.stems[stem.name as StemType] = blobResponse.url;
    }

    // Store metadata in Vercel KV
    await kv.set(`song:${songInfo.id}`, metadata);
    await kv.zadd('songs', { 
      score: Date.now(),
      member: songInfo.id 
    });

    console.log('Successfully processed song:', metadata);
    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Error processing stems:', error);
    return NextResponse.json(
      { 
        error: String(error),
        details: process.env.NODE_ENV === 'development' ? {
          blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
          kvConfigured: !!process.env.KV_REST_API_TOKEN
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Listing song metadata files from Blob storage...');
    const { blobs } = await list({ 
      ...blobConfig,
      prefix: 'songs/' 
    });
    
    console.log('Found blobs:', blobs.map(b => ({
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt
    })));

    const metadataFiles = blobs.filter(blob => blob.pathname.endsWith('metadata.json'));
    console.log('Filtered metadata files:', metadataFiles.length);

    // Sort by upload date descending
    metadataFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    // Get the 5 most recent songs
    const recentMetadata = metadataFiles.slice(0, 5);
    console.log('Processing recent metadata files:', recentMetadata.map(m => m.pathname));

    const songs = await Promise.all(
      recentMetadata.map(async blob => {
        console.log('Fetching metadata from:', blob.url);
        const response = await fetch(blob.url);
        if (!response.ok) {
          console.error('Failed to fetch metadata:', blob.url, response.statusText);
          return null;
        }
        return response.json();
      })
    );

    const validSongs = songs.filter(Boolean);
    console.log('Retrieved valid songs:', validSongs.length);

    return NextResponse.json({ songs: validSongs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 