import { getTracksFromB2 } from '@/lib/b2-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prefix } = await request.json();
    console.log('Testing B2 with prefix:', prefix);
    const album = await getTracksFromB2(prefix.replace(/\/$/, ''));
    console.log('Album:', JSON.stringify(album, null, 2));
    return NextResponse.json(album);
  } catch (error) {
    console.error('Error in /api/test-b2:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
