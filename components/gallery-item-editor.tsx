'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Drawer } from './drawer';
import type { GalleryItem, User } from '@/lib/types';
import { Film } from 'lucide-react';

interface GalleryItemEditorProps {
  item: GalleryItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { caption: string; taggedUsers: string[] }) => Promise<void>;
}

export function GalleryItemEditor({ item, isOpen, onClose, onSave }: GalleryItemEditorProps) {
  const [caption, setCaption] = useState(item.caption || '');
  const [taggedUsers, setTaggedUsers] = useState(item.taggedUsers || []);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [taggedUserDetails, setTaggedUserDetails] = useState<User[]>([]);

  // Fetch all users
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  // Fetch tagged user details
  useEffect(() => {
    if (taggedUsers.length > 0) {
      fetch('/api/users/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: taggedUsers })
      })
        .then(res => res.json())
        .then(setTaggedUserDetails)
        .catch(console.error);
    } else {
      setTaggedUserDetails([]);
    }
  }, [taggedUsers]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({ caption, taggedUsers });
      onClose();
    } catch (error) {
      console.error('Failed to save gallery item:', error);
      // TODO: Add error toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Gallery Item"
    >
      <div className="space-y-6">
        {/* Image Preview */}
        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
          {item.type === 'image' ? (
            <Image
              src={item.url}
              alt={caption}
              className="object-contain"
              fill
              sizes="400px"
            />
          ) : (
            <div className="relative w-full h-full bg-black">
              <Image
                src={item.thumbnailUrl || item.url}
                alt={caption}
                className="object-contain"
                fill
                sizes="400px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Film className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add a caption..."
          />
        </div>

        {/* Tagged Users */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tagged Individuals
          </label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {users.map((user) => (
              <label 
                key={user.id} 
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={taggedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTaggedUsers(prev => [...prev, user.id]);
                    } else {
                      setTaggedUsers(prev => prev.filter(id => id !== user.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  {user.profileImage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={user.profileImage}
                        alt={user.fullName}
                        className="object-cover"
                        fill
                        sizes="32px"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.instruments}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
