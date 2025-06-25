'use client';


import { useState, useEffect } from 'react';
import { GalleryGrid } from '@/components/gallery-grid';
import { X } from 'lucide-react';
import Image from 'next/image';
import type { GalleryItem } from '@/lib/types';

// Ensure TypeScript knows we're using snake_case for these properties
declare module '@/lib/types' {
  interface GalleryItem {
    album_id: string;
    thumbnail_url?: string;
    tagged_users: string[];
    uploaded_by: string;
    created_at: string;
    file_name: string;
    content_type: string;
  }
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) throw new Error('Failed to load gallery items');
        const galleryItems = await response.json();
        setItems(galleryItems);
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGallery();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <GalleryGrid
            items={items}
            onItemUpdate={async (itemId: string, updates: Partial<GalleryItem>) => {
              const item = items.find(i => i.id === itemId)
              if (!item) return
              try {
                const response = await fetch(`/api/albums/${item.album_id}/gallery/${itemId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updates)
                });
                
                if (!response.ok) throw new Error('Failed to update gallery item');
                
                // Update local state
                setItems(prevItems =>
                  prevItems.map(item =>
                    item.id === itemId
                      ? { ...item, ...updates }
                      : item
                  )
                );
              } catch (error) {
                console.error('Failed to update gallery item:', error);
                // TODO: Add error toast
              }
            }}
            onItemSelect={setSelectedItem}
          />
      </div>

      {selectedItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm z-50"
          onClick={(e: React.MouseEvent) => {
            // Only close if clicking the backdrop
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
              <video
                src={selectedItem.url}
                controls
                className="max-w-[90vw] max-h-[85vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
