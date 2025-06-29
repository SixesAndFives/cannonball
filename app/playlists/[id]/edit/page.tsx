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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('title', title);
      if (coverImage) {
        formData.append('cover_image', coverImage);
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
            <div className="flex items-center gap-4">
              <Link href={`/playlists/${id}`} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">Back To Playlist</h1>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {showDeleteConfirm ? 'Click again to confirm' : 'Delete Playlist'}
            </Button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label htmlFor="title" className="font-bold">Playlist Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your playlist"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="coverImage" className="font-bold">Cover Image</Label>
              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Cover Image */}
                <div>
                  <h3 className="text-sm text-gray-600 italic mb-2">Current Cover</h3>
                  <div className="relative aspect-square w-48 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={coverPreview || playlist.cover_image || '/images/playlists/EmptyCover.png'}
                      alt="Current cover"
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

                {/* Upload New Cover */}
                <div>
                  <h3 className="text-sm text-gray-600 italic mb-2">Upload New Cover</h3>
                  <div
                    className="relative flex items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => document.getElementById('coverImage')?.click()}
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: JPG, PNG, GIF
                        </p>
                      </div>
                      <input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
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
        </div>
      </div>
    </div>
  );
}
