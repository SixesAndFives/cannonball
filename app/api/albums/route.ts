import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const albumsPath = path.join(process.cwd(), 'lib', 'albums.json');

export async function GET() {
  try {
    const data = await fs.readFile(albumsPath, 'utf-8');
    const { albums } = JSON.parse(data);
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}
