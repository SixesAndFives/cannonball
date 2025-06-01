import { syncAlbums } from '@/lib/b2-client';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await syncAlbums();
    return NextResponse.json({ message: 'Albums synced successfully' });
  } catch (error) {
    console.error('Error in /api/sync-albums:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
