import { NextResponse } from 'next/server';
import { listFiles } from '@/lib/b2-client';

export async function GET() {
  try {
    const response = await listFiles('Images/');
    return NextResponse.json({
      total: response.files.length,
      files: response.files.map(file => ({
        name: file.fileName,
        size: file.contentLength,
        type: file.contentType,
        uploaded: file.uploadTimestamp
      }))
    });
  } catch (error) {
    console.error('Error listing B2 files:', error);
    return NextResponse.json(
      { error: 'Failed to list B2 files' },
      { status: 500 }
    );
  }
}
