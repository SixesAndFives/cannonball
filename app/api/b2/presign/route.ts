import { NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/b2-s3-client'

export async function POST(request: Request) {
  try {
    const { fileName, contentType } = await request.json()

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      )
    }

    const presignedUrl = await getPresignedUploadUrl(fileName, contentType)
    return NextResponse.json({ url: presignedUrl })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
