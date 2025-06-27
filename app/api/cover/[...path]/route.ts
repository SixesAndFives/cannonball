import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params;
    const fileName = pathSegments.join('/');
    
    // Construct the path to the image in the public directory
    const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
    
    try {
      const imageData = await fs.readFile(imagePath);
      
      // Determine content type based on file extension
      const ext = path.extname(imagePath).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
      }[ext] || 'image/jpeg';
      
      return new Response(imageData, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        }
      });
    } catch (error) {
      console.error('Error reading image file:', error);
      // If file not found, try to serve the placeholder
      const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder-album.jpg');
      const placeholderData = await fs.readFile(placeholderPath);
      
      return new Response(placeholderData, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response('Error serving image', { status: 500 });
  }
}
