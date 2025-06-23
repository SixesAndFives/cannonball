import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Playlist } from '@/lib/types';

const playlistsPath = path.join(process.cwd(), 'lib', 'playlists.json');

async function readPlaylists(): Promise<{ playlists: Playlist[] }> {
  const data = await fs.readFile(playlistsPath, 'utf-8');
  return JSON.parse(data);
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const data = await readPlaylists();
    const playlist = data.playlists.find(p => p.id === id);

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error reading playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const data = await readPlaylists();
    const playlistIndex = data.playlists.findIndex(p => p.id === id);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const updates = await request.json();
    const updatedPlaylist = {
      ...data.playlists[playlistIndex],
      ...updates,
    };

    data.playlists[playlistIndex] = updatedPlaylist;
    await fs.writeFile(playlistsPath, JSON.stringify(data, null, 2));

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const data = await readPlaylists();
    const playlistIndex = data.playlists.findIndex(p => p.id === id);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Remove the playlist
    const [removedPlaylist] = data.playlists.splice(playlistIndex, 1);

    // If there's a cover image, delete it
    if (removedPlaylist.coverImage) {
      const imagePath = path.join(process.cwd(), 'public', removedPlaylist.coverImage);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Error deleting cover image:', error);
      }
    }

    await fs.writeFile(playlistsPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
