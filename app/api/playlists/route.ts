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
    console.log('=== POST /api/playlists ===', {
      time: new Date().toISOString(),
      stage: 'start'
    });

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const cover_image = formData.get('cover_image') as File;
    const userId = formData.get('user_id') as string;

    console.log('=== Playlist Create Data ===', {
      time: new Date().toISOString(),
      hasTitle: !!title,
      hasCoverImage: !!cover_image,
      hasUserId: !!userId,
      stage: 'validation'
    });

    if (!title || !userId) {
      console.error('=== Playlist Create Error ===', {
        time: new Date().toISOString(),
        error: 'Missing required fields',
        hasTitle: !!title,
        hasUserId: !!userId,
        stage: 'validation'
      });
      return NextResponse.json(
        { error: 'Title and user_id are required' },
        { status: 400 }
      );
    }

    // Generate playlist ID once
    const playlistId = uuidv4();
    
    let cover_image_path = '';
    if (cover_image) {
      // Create playlists directory if it doesn't exist
      const playlistsDir = path.join(process.cwd(), 'public', 'images', 'playlists');
      await fs.mkdir(playlistsDir, { recursive: true });

      const ext = path.extname(cover_image.name);
      const filename = `${playlistId}${ext}`;
      const filepath = path.join(playlistsDir, filename);

      // Write the file
      const bytes = await cover_image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      cover_image_path = `/images/playlists/${filename}`;
    }

    console.log('=== Creating Playlist in DB ===', {
      time: new Date().toISOString(),
      playlistId,
      title,
      cover_image_path,
      userId,
      stage: 'database'
    });

    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        id: uuidv4(),
        title,
        cover_image: cover_image_path,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('=== Playlist Create DB Error ===', {
        time: new Date().toISOString(),
        error: error.message,
        stage: 'database'
      });
      throw error;
    }

    console.log('=== Playlist Created Successfully ===', {
      time: new Date().toISOString(),
      playlistId: playlist.id,
      stage: 'complete'
    });

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