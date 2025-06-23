import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { Playlist } from '@/lib/types';

const playlistsPath = path.join(process.cwd(), 'lib', 'playlists.json');
const playlistsDir = path.join(process.cwd(), 'public', 'images', 'playlists');

// Initialize playlists.json if it doesn't exist
async function initPlaylistsFile() {
  try {
    await fs.access(playlistsPath);
  } catch {
    await fs.writeFile(playlistsPath, JSON.stringify({ playlists: [] }, null, 2));
  }
}

// Initialize playlists directory if it doesn't exist
async function initPlaylistsDir() {
  try {
    await fs.access(playlistsDir);
  } catch {
    await fs.mkdir(playlistsDir, { recursive: true });
  }
}

// Read playlists from JSON file
async function readPlaylists(): Promise<{ playlists: Playlist[] }> {
  await initPlaylistsFile();
  const data = await fs.readFile(playlistsPath, 'utf-8');
  return JSON.parse(data);
}

// Write playlists to JSON file
async function writePlaylists(data: { playlists: Playlist[] }) {
  await fs.writeFile(playlistsPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await readPlaylists();
    return NextResponse.json(data.playlists);
  } catch (error) {
    console.error('Error reading playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initPlaylistsDir();
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const createdBy = formData.get('createdBy') as string;
    const coverImage = formData.get('coverImage') as File | null;

    if (!title || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const playlistId = uuidv4();
    let coverImagePath: string | undefined;

    if (coverImage) {
      const ext = coverImage.name.split('.').pop() || 'jpg';
      const filename = `${playlistId}.${ext}`;
      const imagePath = path.join(playlistsDir, filename);
      
      const bytes = await coverImage.arrayBuffer();
      await fs.writeFile(imagePath, Buffer.from(bytes));
      
      coverImagePath = `/images/playlists/${filename}`;
    }

    const newPlaylist: Playlist = {
      id: playlistId,
      title,
      coverImage: coverImagePath,
      createdBy,
      createdAt: Date.now(),
      tracks: []
    };

    const data = await readPlaylists();
    data.playlists.push(newPlaylist);
    await writePlaylists(data);

    return NextResponse.json(newPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
