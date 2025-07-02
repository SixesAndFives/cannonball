import { NextResponse } from 'next/server'
const B2 = require('backblaze-b2')

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

const BUCKET_ID = process.env.B2_BUCKET_ID!

export async function GET() {
  try {
    // Authenticate with B2
    await b2.authorize()

    // Get upload URL and authorization token
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: BUCKET_ID
    })

    return NextResponse.json({ uploadUrl, authorizationToken })
  } catch (error) {
    console.error('Error getting B2 upload URL:', error)
    return NextResponse.json(
      { error: 'Failed to get upload authorization' },
      { status: 500 }
    )
  }
}
