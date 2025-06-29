'use client';

import { useEffect, useState, use } from 'react';

import { Button } from '@/components/ui/button';
import { Music, Play, Trash2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Album, Playlist, Track, PlaylistTrack } from '@/lib/types';
import { toast } from 'sonner';
import { formatDuration } from '@/lib/utils';
import { usePlayer } from '@/contexts/player-context';

export default function PlaylistPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [albums, setAlbums] = useState<Record<string, Album>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack: playInPlayer } = usePlayer();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load playlist
        const response = await fetch(`/api/playlists/${id}`);
        if (!response.ok) throw new Error('Failed to load playlist');
        const playlistData = await response.json();
        setPlaylist(playlistData);

        // Load albums
        const albumsResponse = await fetch('/api/albums');
        if (!albumsResponse.ok) throw new Error('Failed to load albums');
        const albumsData = await albumsResponse.json();

        // Create album lookup map
        const albumMap = albumsData.reduce((acc: Record<string, Album>, album: Album) => {
          acc[album.id] = album;
          return acc;
        }, {});
        setAlbums(albumMap);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load playlist');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
            <div className="h-48 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Playlist not found</h1>
            <p className="text-gray-600 mb-8">This playlist might have been deleted or doesn't exist.</p>
            <Link href="/playlists">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Playlists
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{playlist.title}</h1>
            <Link 
              href="/playlists" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back To Playlists
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-8">
            <div>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={playlist.cover_image || '/images/playlists/EmptyCover.png'}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    if (e.target instanceof HTMLImageElement) {
                      e.target.src = '/images/playlists/EmptyCover.png';
                    }
                  }}
                />

              </div>
            </div>

            <div>
              {playlist.tracks.length > 0 ? (
                <div className="space-y-3">
                  {playlist?.tracks.map((track, index) => {
                    return (
                      <div 
                        key={track.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 group"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={track.cover_image || '/images/EmptyCover.png'}
                            alt={track.album_title || ''}
                            fill
                            className="object-cover rounded"
                            onError={(e) => {
                              if (e.target instanceof HTMLImageElement) {
                                e.target.src = '/images/EmptyCover.png';
                              }
                            }}
                          />

                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{track.title}</h3>
                          <div className="text-sm text-gray-500">{track.album_title}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              // Get all playable tracks from the playlist
                              const playableTracks = playlist.tracks.filter(t => t.audio_url);
                              const trackIndex = playableTracks.findIndex(t => t.id === track.id);

                              // Play the track
                              if (trackIndex !== -1 && track.audio_url) {
                                playInPlayer(
                                  {
                                    id: track.id,
                                    title: track.title,
                                    audio_url: track.audio_url!,
                                    album_id: track.album_id,
                                    cover_image: track.cover_image,
                                  },
                                  trackIndex,
                                  playableTracks.map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    audio_url: t.audio_url!,
                                    album_id: t.album_id,
                                    cover_image: t.cover_image
                                  }))
                                );
                              }
                            }}
                          >
                            <Play className="w-5 h-5 text-gray-600" />
                            {!track.audio_url && <span className="text-red-500">(Not available)</span>}
                          </button>
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={async () => {
                              if (!track.id) return;
                              setIsDeleting(track.id);

                              try {
                                const response = await fetch(`/api/playlists/${id}/tracks/${track.id}`, {
                                  method: 'DELETE'
                                });

                                if (!response.ok) throw new Error('Failed to delete track');

                                // Refresh playlist data
                                const playlistResponse = await fetch(`/api/playlists/${id}`);
                                if (!playlistResponse.ok) throw new Error('Failed to refresh playlist');
                                const updatedPlaylist = await playlistResponse.json();
                                setPlaylist(updatedPlaylist);

                                toast.success('Track removed from playlist');
                              } catch (error) {
                                console.error('Error deleting track:', error);
                                toast.error('Failed to remove track');
                              } finally {
                                setIsDeleting(null);
                              }
                            }}
                          >
                            {isDeleting === track.id ? (
                              <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-gray-300/20 border-t-gray-300 rounded-full animate-spin" />
                              </div>
                            ) : (
                              <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600 transition-colors" />
                            )}
                          </button>
                          <div className="text-sm text-gray-600 w-12">
                            {track.duration ? formatDuration(track.duration) : '0:00'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tracks yet</h3>
                  <p className="text-gray-600">
                    Add tracks to your playlist from any album.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
