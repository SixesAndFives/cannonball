import { NextRequest } from 'next/server';
import { authorize } from '@/lib/b2-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const fullPath = decodeURIComponent(path.join('/'));
  
  // Extract the file name from the full B2 URL if present
  const fileName = fullPath.includes('backblazeb2.com') 
    ? fullPath.split('/file/cannonball-music/')[1]
    : fullPath;

  if (!fileName) {
    return new Response('Invalid file path', { status: 400 });
  }

  // Get a fresh download URL with authorization
  const { downloadUrl, authToken } = await authorize();
  const [albumId, filename] = path;
  const b2Url = `${downloadUrl}/file/cannonball-music/${albumId}/${filename}`;
  
  console.log('Fetching image from:', b2Url);
  console.log('Using download URL:', b2Url);
  const response = await fetch(b2Url, {
    headers: {
      'Authorization': authToken,
      'Accept': 'image/*'
    }
  });

  if (!response.ok) {
    console.error('B2 response error:', {
      status: response.status,
      statusText: response.statusText,
      body: await response.text()
    });
    return new Response('Failed to fetch image', { status: response.status });
  }

  // Forward the image response
  const headers = new Headers();
  headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=31536000');
  
  return new Response(response.body, {
    status: response.status,
    headers
  });
}
