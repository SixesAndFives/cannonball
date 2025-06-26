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
    // Normalize updates to use snake_case
    const normalizedUpdates = {
      caption: updates.caption,
      tagged_users: updates.taggedUsers || updates.tagged_users
    };
    console.log('API: Updates to apply:', normalizedUpdates);

    const updatedItem = await updateGalleryItem(id, normalizedUpdates);
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
