import { NextResponse } from 'next/server'
const B2 = require('backblaze-b2')

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

const BUCKET_ID = process.env.B2_BUCKET_ID!
const BUCKET_NAME = 'cannonball-music'

export async function POST(request: Request) {
  try {
    // Get file and metadata from request
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const contentType = formData.get('contentType') as string

    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'File and fileName are required' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Authenticate with B2
    await b2.authorize()

    // Get upload URL and auth token
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: BUCKET_ID
    })

    // Upload to B2
    const { data } = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: buffer,
      contentType
    })

    // Return the file URL
    const url = `https://f004.backblazeb2.com/file/${BUCKET_NAME}/${fileName}`
    return NextResponse.json({ url })

  } catch (error) {
    console.error('Error uploading to B2:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
