import { NextRequest } from 'next/server'
import { getAudioUrl } from '@/lib/audio-service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const filePath = path.join('/')
    console.log('Audio request for:', filePath)

    // Get a signed URL from Supabase storage
    const signedUrl = await getAudioUrl(filePath)

    // Redirect to the signed URL
    return Response.redirect(signedUrl)
  } catch (error) {
    console.error('Error serving audio file:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
