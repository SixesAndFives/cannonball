import { updateGalleryItem } from '@/lib/gallery-service';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Received PATCH request for gallery item:', id);
    const updates = await request.json();
    console.log('API: Updates to apply:', updates);

    const updatedItem = await updateGalleryItem(id, updates);
    console.log('API: Result from updateGalleryItem:', updatedItem);
    
    if (!updatedItem) {
      console.log('API: No item was updated');
      return new NextResponse('Gallery item not found', { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('API: Failed to update gallery item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
