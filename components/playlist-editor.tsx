'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Drawer } from './drawer';
import { Trash2 } from 'lucide-react';
import type { Playlist } from '@/lib/types';
import { toast } from 'sonner';

interface PlaylistEditorProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { title: string; cover_image?: File }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function PlaylistEditor({ playlist, isOpen, onClose, onSave, onDelete }: PlaylistEditorProps) {
  const [title, setTitle] = useState(playlist.title);
  const [cover_image, setCoverImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({ 
        title, 
        ...(cover_image && { cover_image })
      });
      toast.success('Playlist updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save playlist:', error);
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
      await onDelete();
      toast.success('Playlist deleted successfully');
      onClose();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Playlist"
    >
      <div className="space-y-6">
        {/* Cover Image Preview */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={cover_image ? URL.createObjectURL(cover_image) : playlist.cover_image || '/images/playlists/EmptyCover.png'}
            alt={title}
            className="object-cover"
            fill
            sizes="400px"
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <label htmlFor="cover-image" className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image
          </label>
          <input
            type="file"
            id="cover-image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setCoverImage(file);
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:border file:border-gray-300
              file:text-sm file:font-medium
              file:bg-white file:text-gray-900
              hover:file:bg-gray-50"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || (!cover_image && title === playlist.title)}
          className="w-full bg-primary py-2 px-4 text-white hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 py-2 px-4 text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 flex items-center justify-center gap-2 mt-2"
        >
          <Trash2 className="w-4 h-4" />
          {showDeleteConfirm ? 'Click again to confirm delete' : 'Delete Playlist'}
        </button>
      </div>
    </Drawer>
  );
}
