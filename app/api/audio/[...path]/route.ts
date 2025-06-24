import { NextRequest } from 'next/server'
import { authorize } from '@/lib/b2-client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    // Get the B2 file path from the URL parameters
    const filePath = path.join('/')
    console.log('Audio request for:', filePath)
    
    // Get an authorized download URL from B2
    console.log('Getting B2 authorization...')
    const { downloadUrl, authToken } = await authorize()
    console.log('B2 auth result:', { downloadUrl: !!downloadUrl, authToken: !!authToken })
    
    if (!downloadUrl || !authToken) {
      console.error('B2 authorization failed')
      return new Response('Unauthorized', { status: 401 })
    }

    // Construct the authorized URL
    const fileUrl = `${downloadUrl}/file/cannonball-music/${filePath}`
    console.log('Generated B2 URL:', fileUrl)

    // Fetch the audio file from B2
    const audioResponse = await fetch(fileUrl)
    if (!audioResponse.ok) {
      throw new Error(`B2 responded with ${audioResponse.status}`)
    }
    
    // Get the audio data and content type
    const audioData = await audioResponse.arrayBuffer()
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg'
    
    // Return the audio data with appropriate headers
    return new Response(audioData, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioResponse.headers.get('content-length') || '',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Error serving audio file:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
