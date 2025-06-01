import { NextResponse } from 'next/server';
import { getBighornStudiosAlbum } from '@/lib/b2-client';

export async function GET() {
  try {
    const album = await getBighornStudiosAlbum();
    return NextResponse.json({ albums: [album] });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}
