'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Film, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { GalleryItem } from '@/lib/types';

interface GalleryGridProps {
  items: GalleryItem[]
  onItemUpdate?: (itemId: string, updates: Partial<GalleryItem>) => Promise<void>
  onItemDelete?: (itemId: string) => Promise<void>
  onItemSelect?: (item: GalleryItem) => void
}

export function GalleryGrid({ items, onItemUpdate, onItemDelete, onItemSelect }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const router = useRouter();

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedItem(null);
  };

  const navigateImage = (direction: "next" | "prev") => {
    if (!selectedItem) return;

    const currentIndex = items.findIndex(item => item.id === selectedItem.id);
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % items.length;
    } else {
      newIndex = (currentIndex - 1 + items.length) % items.length;
    }

    setSelectedItem(items[newIndex]);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col"
          >
            <div className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100">
              {/* Edit button at the top */}
              <div className="absolute top-0 right-0 p-2 z-10">
                <button
                  className="text-xs bg-black/50 text-white px-2 py-1 rounded hover:bg-black/75 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/gallery/${item.id}/edit`);
                  }}
                >
                  EDIT
                </button>
              </div>

              {/* Image/Video */}
              <div 
                className="relative w-full h-full"
                onClick={() => onItemSelect ? onItemSelect(item) : openLightbox(item)}
              >
                {item.type === 'video' ? (() => {
                  console.log('Video item:', {
                    id: item.id,
                    type: item.type,
                    url: item.url,
                    thumbnail_url: item.thumbnail_url
                  });
                  
                  return (
                    <div className="relative w-full h-full">
                      {item.thumbnail_url ? (
                        <>
                          <Image
                            src={item.thumbnail_url}
                            alt={item.caption || ''}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            onError={(e) => {
                              console.error('Error loading thumbnail:', e);
                              // Fall back to video icon
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Film className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                          <Film className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })() : item.url ? (
                  <Image
                    src={item.url}
                    alt={item.caption || ''}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-gray-400">No preview</div>
                  </div>
                )}
              </div>
            </div>

            {/* Caption below the image */}
            {item.caption && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {item.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              className="absolute left-4 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button
              className="absolute right-4 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="max-w-7xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.caption || ''}
                    className="object-contain"
                    fill
                    sizes="90vw"
                  />
                </div>
              )}
              {selectedItem.caption && (
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-center">{selectedItem.caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </>
  );
}
