/// <reference types="node" />
import { NextResponse } from 'next/server';

import { put, list } from '@vercel/blob';
import { kv } from '@vercel/kv';

// Configure blob client with environment variable
const getBlobConfig = () => {
  const token = process.env.LUPE_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('LUPE_BLOB_READ_WRITE_TOKEN environment variable is not set');
  }
  return { token };
};

export async function POST(request: Request) {
  try {
    const { songInfo, stems } = await request.json();

    // Validate request
    if (!songInfo || !stems || !Array.isArray(stems)) {
      return NextResponse.json(
        { error: 'Missing or invalid stems data' },
        { status: 400 }
      );
    }

    // Get blob config
    const blobConfig = getBlobConfig();

    console.log(`Starting upload of ${stems.length} stems...`);

    // Upload each stem to blob storage
    const stemUploads = await Promise.all(
      stems.map(async (stem, index) => {
        if (!stem.name || !stem.data) {
          throw new Error(`Invalid stem data: ${JSON.stringify(stem)}`);
        }

        console.log(`Processing stem ${index + 1}/${stems.length}: ${stem.name}`);

        // Convert base64 to buffer
        const binaryString = atob(stem.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = await put(
          `stems/${songInfo.id}/${stem.name}.m4a`,
          bytes.buffer,
          {
            ...blobConfig,
            access: 'public',
            addRandomSuffix: false,
            contentType: 'audio/aac'
          }
        );

        console.log(`Uploaded ${stem.name} (${bytes.length} bytes) to:`, blob.url);
        return [stem.name, blob.url];
      })
    );

    // Create stems record
    const stemUrls = Object.fromEntries(stemUploads);
    console.log('Created stem URLs:', stemUrls);

    // Save to KV
    const metadata = {
      id: songInfo.id,
      title: songInfo.title,
      date: songInfo.date,
      stems: stemUrls
    };

    console.log('Saving metadata to KV:', metadata);
    await kv.set(`song:${songInfo.id}`, metadata);
    await kv.zadd('songs', {
      score: Date.now(),
      member: songInfo.id
    });

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Error processing stems:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check blob config at runtime
    const blobConfig = getBlobConfig();

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