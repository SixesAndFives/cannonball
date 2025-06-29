import { NextRequest } from 'next/server'
import { getAudioUrl } from '@/lib/audio-service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const filePath = path.join('/')
    
    console.log('=== Audio API Request ===', {
      time: new Date().toISOString(),
      rawPath: path,
      filePath,
      url: request.url,
      stage: 'start'
    })

    // Get a signed URL from Supabase storage
    const signedUrl = await getAudioUrl(filePath)

    console.log('=== Audio API Success ===', {
      time: new Date().toISOString(),
      filePath,
      hasSignedUrl: !!signedUrl,
      stage: 'complete'
    })

    // Redirect to the signed URL
    return Response.redirect(signedUrl)
  } catch (error) {
    console.error('Error serving audio file:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
