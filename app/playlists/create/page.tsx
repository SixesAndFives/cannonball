'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== Playlist Create Submit ===', {
      time: new Date().toISOString(),
      hasUser: !!user,
      userId: user?.id,
      title,
      hasCoverImage: !!coverImage,
      stage: 'start'
    });

    if (!user) {
      console.error('=== Playlist Create Error ===', {
        time: new Date().toISOString(),
        error: 'No user found',
        stage: 'validation'
      });
      return;
    }

    if (!title.trim()) {
      console.error('=== Playlist Create Error ===', {
        time: new Date().toISOString(),
        error: 'Empty title',
        stage: 'validation'
      });
      toast({
        title: 'Error',
        description: 'Please enter a playlist title',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('=== Playlist Create Request ===', {
        time: new Date().toISOString(),
        title: title.trim(),
        hasCoverImage: !!coverImage,
        stage: 'request'
      });

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('user_id', user.id);
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const response = await fetch('/api/playlists', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      console.log('=== Playlist Create Response ===', {
        time: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        data,
        stage: 'response'
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playlist');
      }

      console.log('=== Playlist Create Success ===', {
        time: new Date().toISOString(),
        playlistId: data.id,
        stage: 'success'
      });

      toast({
        title: 'Success',
        description: 'Playlist created successfully',
      });

      router.push('/playlists');
    } catch (error) {
      console.error('=== Playlist Create Error ===', {
        time: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'request'
      });
      toast({
        title: 'Error',
        description: 'Failed to create playlist',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/playlists" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Create Playlist</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Playlist Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your playlist"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="mt-1 space-y-4">
                {coverPreview ? (
                  <div className="relative aspect-square w-48 overflow-hidden rounded-lg">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverPreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/75"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    className="relative flex items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('border-primary');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-primary');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-primary');
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        setCoverImage(file);
                        const url = URL.createObjectURL(file);
                        setCoverPreview(url);
                      }
                    }}
                    onClick={() => document.getElementById('coverImage')?.click()}
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Drag and drop or click to upload
                        </p>
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
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/playlists">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Playlist'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
