'use client';

import { useState, useEffect } from 'react';
import { GalleryGrid } from '@/components/gallery-grid';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { GalleryItem } from '@/lib/types';

export default function GalleryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);


  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch('/api/albums/all/gallery');
        if (!response.ok) throw new Error('Failed to load gallery items');
        const galleryItems = await response.json();
        setItems(galleryItems);
      } catch (error) {
        console.error('Error loading gallery:', error);
        toast({
          title: 'Error',
          description: 'Failed to load gallery items',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGallery();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleSave = async (itemId: string, updates: { caption: string; taggedUsers: string[] }) => {
    console.log('[Page] Saving gallery item:', itemId);
    console.log('[Page] Updates:', updates);
    
    const item = items.find(i => i.id === itemId)
    if (!item) {
      const error = new Error('Gallery item not found');
      console.error('[Page] Item not found:', itemId);
      toast({
        title: 'Error',
        description: 'Gallery item not found',
        variant: 'destructive'
      });
      throw error;
    }

    try {
      console.log('[Page] Making API request to:', `/api/albums/${item.album_id}/gallery/${itemId}`);
      const response = await fetch(`/api/albums/${item.album_id}/gallery/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: updates.caption,
          taggedUsers: updates.taggedUsers
        })
      });

      const responseText = await response.text();
      console.log('[Page] API Response:', responseText);

      if (!response.ok) {
        const error = new Error(`API returned ${response.status}: ${responseText}`);
        console.error('[Page] API error:', error);
        toast({
          title: 'Error',
          description: 'Failed to update gallery item',
          variant: 'destructive'
        });
        throw error;
      }

      const updatedItem = JSON.parse(responseText);
      console.log('[Page] Parsed response:', updatedItem);
      
      // Update local state with the normalized response
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? updatedItem
            : item
        )
      );

      toast({
        title: 'Success',
        description: 'Gallery item updated'
      });
      
      console.log('[Page] Save completed successfully');
    } catch (error) {
      console.error('Failed to update gallery item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update gallery item',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleDelete = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    try {
      const response = await fetch(`/api/albums/${item.album_id}/gallery/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete gallery item');
      
      // Update local state
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));

      toast({
        title: 'Success',
        description: 'Gallery item deleted'
      });
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete gallery item',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <GalleryGrid
          items={items}
          onItemSelect={setSelectedItem}
          onItemUpdate={async (itemId, updates: any) => {
            await handleSave(itemId, {
              caption: updates.caption || '',
              taggedUsers: updates.taggedUsers || updates.tagged_users || []
            });
          }}
          onItemDelete={async (itemId) => {
            await handleDelete(itemId);
          }}
        />
      </div>



      {/* Lightbox */}
      {selectedItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm z-50"
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div 
            className="relative max-w-[95vw] max-h-[95vh] bg-black rounded-lg overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors duration-200"
            >
              <X size={24} />
            </button>
            {selectedItem.type === 'image' ? (
              <div className="relative w-[90vw] h-[85vh]">
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.caption || ''}
                  className="object-contain"
                  fill
                  sizes="90vw"
                  priority
                  quality={95}
                />
              </div>
            ) : (
              <div className="relative w-[90vw] h-[85vh]">
                <video
                  src={selectedItem.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
