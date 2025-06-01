import { NextRequest } from 'next/server'
import { authorize } from '@/lib/b2-client'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the B2 file path from the URL parameters
    const filePath = params.path.join('/')
    
    // Get an authorized download URL from B2
    const { downloadUrl, authToken } = await authorize()
    if (!downloadUrl || !authToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Construct the authorized URL
    const fileUrl = `${downloadUrl}/file/cannonball-music/${filePath}`

    // Return a redirect to the authorized URL
    return Response.redirect(fileUrl)
  } catch (error) {
    console.error('Error serving audio file:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
