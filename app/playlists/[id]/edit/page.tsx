'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Trash2 } from 'lucide-react';
import type { Playlist } from '@/lib/types';
import { DraggableTrackList } from '@/components/playlist/draggable-track-list';

export default function EditPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Fetch playlist data
    fetch(`/api/playlists/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlaylist(data);
        setTitle(data.title);
        if (data.cover_image) {
          setCoverPreview(data.cover_image);
        }
      })
      .catch(() => {
        toast.error('Failed to load playlist');
        router.push('/playlists');
      });
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const isFavorites = id.endsWith('-favorites');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formData = new FormData();
      if (!isFavorites) {
        formData.append('title', title);
        if (coverImage) {
          formData.append('cover_image', coverImage);
        }
      }

      const response = await fetch(`/api/playlists/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update playlist');
      }

      toast.success('Playlist updated successfully');
      router.push(`/playlists/${id}`);
    } catch (error) {
      toast.error('Failed to update playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      toast.success('Playlist deleted successfully');
      router.push('/playlists');
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  if (!playlist) {
    return null; // Or loading state
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/playlists" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group">
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-lg font-medium">Back To Playlists</span>
            </Link>
            {!id.endsWith('-favorites') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {showDeleteConfirm ? 'Click again to confirm' : 'Delete Playlist'}
              </Button>
            )}
          </div>

          {isFavorites ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                {playlist.cover_image && (
                  <Image
                    src={playlist.cover_image}
                    alt={playlist.title}
                    width={160}
                    height={160}
                    className="rounded-lg shadow-md"
                  />
                )}
                <h1 className="text-2xl font-bold">{playlist.title}</h1>
              </div>
              <div className="flex justify-end">
                <Link href={`/playlists/${id}`}>
                  <Button variant="outline">Done</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter playlist title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover">Cover Image</Label>
                  <div className="flex items-center gap-4">
                    {coverPreview && (
                      <Image
                        src={coverPreview}
                        alt="Cover preview"
                        width={100}
                        height={100}
                        className="rounded-lg"
                      />
                    )}
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('cover')?.click()}
                        type="button"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: JPG, PNG, GIF
                      </p>
                      <input
                        type="file"
                        id="cover"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/playlists/${id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Track Order</h2>
            {playlist.tracks && playlist.tracks.length > 0 ? (
              <DraggableTrackList
                tracks={playlist.tracks}
                isEditing={true}
                onReorder={async (updates) => {
                  try {
                    const response = await fetch(`/api/playlists/${id}/reorder`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(updates),
                    });
                    if (!response.ok) throw new Error('Failed to update track order');
                    
                    // Update local state
                    setPlaylist(prev => {
                      if (!prev) return null;
                      const newTracks = [...prev.tracks];
                      updates.forEach(update => {
                        const track = newTracks.find(t => t.id === update.id);
                        if (track) {
                          track.position = update.position;
                        }
                      });
                      newTracks.sort((a, b) => (a.position || 0) - (b.position || 0));
                      return { ...prev, tracks: newTracks };
                    });
                    
                    toast.success('Track order updated');
                  } catch (error) {
                    toast.error('Failed to update track order');
                  }
                }}
              />
            ) : (
              <p className="text-gray-500">No tracks in playlist</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
