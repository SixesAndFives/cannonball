const B2 = require('backblaze-b2')
import { randomUUID } from 'crypto'
import { lookup } from 'mime-types'

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

const BUCKET_NAME = 'cannonball-music'
const BUCKET_ID = process.env.B2_BUCKET_ID!

interface UploadResult {
  fileId: string
  fileName: string
  url: string
}

export async function uploadToB2(
  file: Buffer | Uint8Array,
  originalFilename: string,
  album_id: string
): Promise<UploadResult> {
  try {
    console.log('Starting B2 upload for:', originalFilename)
    console.log('B2 credentials:', {
      keyId: process.env.B2_APPLICATION_KEY_ID?.slice(0, 5),
      key: process.env.B2_APPLICATION_KEY?.slice(0, 5)
    })
    // Authenticate with B2
    await b2.authorize()

    // Generate a unique filename
    const fileId = randomUUID()
    const extension = originalFilename.split('.').pop()
    const fileName = `images/${album_id}/${fileId}.${extension}`

    // Get upload URL
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: BUCKET_ID
    })

    // Upload file
    const { data } = await b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: fileName,
      data: file,
      mime: lookup(originalFilename) || 'application/octet-stream'
    })

    return {
      fileId,
      fileName: data.fileName,
      url: `https://f004.backblazeb2.com/file/${BUCKET_NAME}/${fileName}`
    }
  } catch (error) {
    console.error('Error uploading to B2:', error)
    throw new Error('Failed to upload file to B2')
  }
}

export async function deleteFromB2(fileName: string): Promise<boolean> {
  try {
    // Authenticate with B2
    await b2.authorize()

    // Find the file ID first
    const { data: { files } } = await b2.listFileNames({
      bucketId: BUCKET_ID,
      prefix: fileName,
      maxFileCount: 1
    })

    if (files.length === 0) {
      throw new Error('File not found')
    }

    // Delete the file
    await b2.deleteFileVersion({
      fileId: files[0].fileId,
      fileName: files[0].fileName
    })

    return true
  } catch (error) {
    console.error('Error deleting from B2:', error)
    return false
  }
}

// List files in an album's directory
export async function listAlbumFiles(album_id: string): Promise<string[]> {
  try {
    // Authenticate with B2
    await b2.authorize()

    const { data: { files } } = await b2.listFileNames({
      bucketId: BUCKET_ID,
      prefix: `images/${album_id}/`,
      maxFileCount: 1000
    })

    return files.map((file: { fileName: string }) => 
      `https://f004.backblazeb2.com/file/${BUCKET_NAME}/${file.fileName}`
    )
  } catch (error) {
    console.error('Error listing album files:', error)
    return []
  }
}
