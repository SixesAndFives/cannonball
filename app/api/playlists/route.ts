import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Playlist } from '@/lib/types';
import { getAllPlaylists } from '@/lib/playlist-service';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  try {
    console.log('GET /api/playlists - Starting request');
    const playlists = await getAllPlaylists();
    console.log('GET /api/playlists - Got playlists:', JSON.stringify(playlists, null, 2));
    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error reading playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const coverImage = formData.get('coverImage') as File;
    const userId = formData.get('user_id') as string;

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and user_id are required' },
        { status: 400 }
      );
    }

    let coverImagePath = '';
    if (coverImage) {
      // Create playlists directory if it doesn't exist
      const playlistsDir = path.join(process.cwd(), 'public', 'images', 'playlists');
      await fs.mkdir(playlistsDir, { recursive: true });

      // Generate unique filename using playlist ID
      const playlistId = uuidv4();
      const ext = path.extname(coverImage.name);
      const filename = `${playlistId}${ext}`;
      const filepath = path.join(playlistsDir, filename);

      // Convert File to Buffer and save
      const bytes = await coverImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      coverImagePath = `/images/playlists/${filename}`;
    }

    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        id: uuidv4(),
        title,
        cover_image: coverImagePath,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // First delete all playlist tracks
    const { error: deleteTracksError } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', id);

    if (deleteTracksError) throw deleteTracksError;

    // Then delete the playlist
    const { error: deletePlaylistError } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (deletePlaylistError) throw deletePlaylistError;

    // Note: Cover image deletion from storage will be handled later
    // when we implement Supabase storage

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}