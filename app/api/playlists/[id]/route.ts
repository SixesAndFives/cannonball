import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { normalizePlaylist } from '@/lib/playlist-service';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: playlist, error } = await supabase
      .from('playlists')
      .select('*, playlist_tracks(*, tracks(*, albums(*)))')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const normalizedPlaylist = await normalizePlaylist(playlist);
    return NextResponse.json(normalizedPlaylist);
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const coverImage = formData.get('file') as File | null;

    let coverImagePath = undefined;
    if (coverImage) {
      // Convert File to Buffer
      const buffer = Buffer.from(await coverImage.arrayBuffer())
      const ext = path.extname(coverImage.name)
      const filename = `${id}${ext}`
      
      // Upload to B2 using existing client
      const { uploadToB2 } = await import('@/lib/b2-image-client')
      const { url } = await uploadToB2(buffer, filename, 'playlists')
      
      // Use the B2 URL
      coverImagePath = url
    }

    const { data: playlist, error } = await supabase
      .from('playlists')
      .update({
        title,
        ...(coverImagePath && { cover_image: coverImagePath })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const normalizedPlaylist = await normalizePlaylist(playlist);
    return NextResponse.json(normalizedPlaylist);
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
