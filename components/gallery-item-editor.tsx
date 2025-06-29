'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Drawer } from '@/components/drawer';
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
    if (isSaving) return;
    
    try {
      console.log('[Editor] Starting save...');
      console.log('[Editor] Saving with caption:', caption);
      console.log('[Editor] Saving with taggedUsers:', taggedUsers);
      setIsSaving(true);
      
      console.log('[Editor] Calling onSave with:', { caption, taggedUsers });
      await onSave({ caption, taggedUsers });
      
      console.log('[Editor] Save successful');
      setIsSaving(false);
      
      // Only close after save is complete
      console.log('[Editor] Closing editor');
      onClose();
    } catch (error) {
      console.error('[Editor] Failed to save gallery item:', error);
      setIsSaving(false);
      // TODO: Add error toast
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
      <div className="flex flex-col gap-6">
        {/* Image Preview */}
        {/* Image Preview */}
        <div className="relative w-60 h-60 mx-auto rounded-lg overflow-hidden bg-gray-100">
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
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="w-12 h-12 text-white opacity-75" />
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <label htmlFor="caption" className="text-sm font-bold">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full h-24 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Add a caption..."
          />
        </div>

        {/* Tagged Users */}
        <div className="space-y-2">
          <label className="text-sm font-bold">Tagged Users</label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
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
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{user.full_name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSave();
              }}
              disabled={isSaving}
              className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                Delete
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Delete Gallery Item?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
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
