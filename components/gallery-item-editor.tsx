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
  onDelete?: () => Promise<void>;
}

export function GalleryItemEditor({ item, isOpen, onClose, onSave, onDelete }: GalleryItemEditorProps) {
  const [caption, setCaption] = useState(item.caption || '');
  const [taggedUsers, setTaggedUsers] = useState(item.tagged_users || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      // TODO: Add error toast
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
                src={item.thumbnail_url || item.url}
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
                  {user.profile_image && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={user.profile_image}
                        alt={user.full_name}
                        className="object-cover"
                        fill
                        sizes="32px"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-sm">{user.full_name}</span>
                    <div className="text-sm text-gray-500">{user.instruments}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? 'Deleting...' : 'Delete Item'}
            </button>
          )}

          {/* Save Button */}
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Delete Gallery Item?</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
