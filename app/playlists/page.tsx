'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Music, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Playlist } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistUsers, setPlaylistUsers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load playlists
        const playlistsResponse = await fetch('/api/playlists');
        if (!playlistsResponse.ok) throw new Error('Failed to load playlists');
        const playlistsData = await playlistsResponse.json();
        setPlaylists(playlistsData || []);

        // Load users for each playlist
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) throw new Error('Failed to load users');
        const usersData = await usersResponse.json();
        
        // Create a map of user ID to user data
        const userMap = usersData.reduce((acc: Record<string, any>, user: any) => {
          acc[user.id] = user;
          return acc;
        }, {});
        
        setPlaylistUsers(userMap);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load playlists');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sort playlists - current user's favorites first, then everything else
  const sortedPlaylists = user ? [
    // Current user's favorites
    ...playlists.filter(p => p.id.endsWith('-favorites') && p.createdBy === user.id),
    // All other playlists
    ...playlists.filter(p => !(p.id.endsWith('-favorites') && p.createdBy === user.id))
  ] : playlists;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <Button asChild>
              <Link href="/playlists/create">
                <Plus className="w-4 h-4 mr-2" />
                New Playlist
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-lg animate-pulse aspect-square"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedPlaylists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/playlists/${playlist.id}`}
                  className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    {playlist.coverImage ? (
                      <Image
                        src={playlist.coverImage}
                        alt={playlist.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Music className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{playlist.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {playlist.tracks?.length || 0} tracks
                      </p>
                    </div>
                    {playlistUsers[playlist.createdBy]?.profileImage && (
                      <Image
                        src={playlistUsers[playlist.createdBy].profileImage}
                        alt={playlistUsers[playlist.createdBy].fullName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
