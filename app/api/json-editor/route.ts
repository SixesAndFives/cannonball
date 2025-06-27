import { NextResponse } from 'next/server'
import { fetchJsonFromB2, uploadJsonToB2 } from '@/lib/b2-service'

export async function POST(request: Request) {
  try {
    console.log('Starting JSON editor request...');

    // Get the request body
    const body = await request.json()
    const { fileName } = body

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
    }

    console.log('Attempting to fetch:', fileName);
    
    // Fetch current JSON
    const currentJson = await fetchJsonFromB2(fileName)
    
    console.log('Successfully fetched JSON. Processing...');
    
    // Simple transformation: replace /test/images/ with /images/
    if (currentJson && currentJson.albums) {
      const updatedJson = {
        ...currentJson,
        albums: currentJson.albums.map((album: any) => ({
          ...album,
          coverImage: album.coverImage?.replace('/test/images/', '/images/')
        }))
      }

      console.log('JSON transformed. Saving backup...');

      // Backup the current file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupName = fileName.replace('.json', `-${timestamp}.json`)
      await uploadJsonToB2(backupName, currentJson)

      console.log('Backup saved. Uploading new version...');

      // Upload the modified JSON
      await uploadJsonToB2(fileName, updatedJson)

      console.log('Update complete.');

      return NextResponse.json({
        success: true,
        message: 'JSON updated successfully',
        backup: backupName
      })
    }
    
    return NextResponse.json({ 
      error: 'Invalid JSON structure - no albums array found'
    }, { status: 400 })
  } catch (error: any) {
    console.error('Error in JSON editor:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
