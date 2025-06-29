'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Music, Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Playlist } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';


export default function PlaylistsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
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
        
        // Ensure each playlist has a tracks array
        const validatedPlaylists = (playlistsData || []).map((playlist: any) => ({
          ...playlist,
          tracks: playlist.tracks || []
        }));
        setPlaylists(validatedPlaylists);

        // Load users for each playlist
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) throw new Error('Failed to load users');
        const usersData = await usersResponse.json();
        
        // Create a map of user ID to user data
        console.log('Users data:', usersData);
        const userMap = usersData.reduce((acc: Record<string, any>, user: any) => {
          acc[user.id] = user;
          return acc;
        }, {});
        console.log('User map:', userMap);
        
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

  const myPlaylists = playlists.filter(p => p.user_id === user?.id);
  const bandmatesPlaylists = playlists.filter(p => p.user_id !== user?.id);

  // Sort my playlists - favorites first
  const sortedMyPlaylists = [
    ...myPlaylists.filter(p => p.id.endsWith('-favorites')),
    ...myPlaylists.filter(p => !p.id.endsWith('-favorites'))
  ];



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
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">My Playlists</h2>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3 max-w-[312px] mx-auto' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4'} items-stretch`}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-lg animate-pulse aspect-square"
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Bandmates Playlists</h2>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3 max-w-[312px] mx-auto' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4'} items-stretch`}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-lg animate-pulse aspect-square"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* My Playlists Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4">My Playlists</h2>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3 max-w-[312px] mx-auto' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4'} items-stretch`}>
                  {sortedMyPlaylists.map((playlist) => (
                    <Link 
                      href={`/playlists/${playlist.id}`}
                      key={playlist.id} 
                      className={`group relative bg-white rounded-lg shadow overflow-hidden ${isMobile ? 'w-full max-w-[300px] mx-auto' : ''} hover:shadow-lg transition-shadow duration-200`}
                    >
                      <div className="aspect-square relative">
                        {/* Add hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 z-10" />
                        {/* Edit button - only show for non-Favorites playlists */}
                        {!playlist.title.includes('Favorites') && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              router.push(`/playlists/${playlist.id}/edit`)
                            }}
                            className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors duration-200"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <Image
                          src={playlist.cover_image || '/images/playlists/EmptyCover.png'}
                          alt={playlist.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/images/playlists/EmptyCover.png';
                          }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4 relative z-20">
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">{playlist.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {playlist.tracks?.length || 0} tracks
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          created by: {playlistUsers[playlist.user_id]?.full_name || 'Unknown'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bandmates Playlists Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Bandmates Playlists</h2>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3 max-w-[312px] mx-auto' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4'} items-stretch`}>
                  {bandmatesPlaylists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlists/${playlist.id}`}
                      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full block"
                    >
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        {playlist.cover_image ? (
                          <Image
                            src={playlist.cover_image}
                            alt={playlist.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Music className={`${isMobile ? 'w-[70px] h-[70px]' : 'w-14 h-14'} text-gray-400`} />
                          </div>
                        )}
                      </div>
                      <div className={`${isMobile ? 'p-5 h-[106px]' : 'p-4 h-[85px]'} flex flex-col justify-between overflow-hidden`}>
                        <div>
                          <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-base'} truncate`}>{playlist.title}</h3>
                          <p className={`text-gray-600 ${isMobile ? 'text-base' : 'text-sm'}`}>
                            {playlist.tracks?.length || 0} tracks
                          </p>
                        </div>
                        {playlistUsers[playlist.user_id] && (
                          <p className={`text-gray-500 pb-3 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                            created by: {playlistUsers[playlist.user_id].full_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
