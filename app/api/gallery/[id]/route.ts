import { updateGalleryItem } from '@/lib/gallery-service';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json();
    const updatedItem = await updateGalleryItem(id, updates);
    
    if (!updatedItem) {
      return new NextResponse('Gallery item not found', { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Failed to update gallery item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
