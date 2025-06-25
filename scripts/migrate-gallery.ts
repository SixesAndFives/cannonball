import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'
import fetch from 'node-fetch'

// @ts-ignore
global.fetch = fetch

// You'll need to provide these
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function readJsonFile(filePath: string) {
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

interface GalleryItem {
  id: string
  albumId: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  caption?: string
  taggedUsers: string[]
  fileName: string
  contentType: string
  uploadTimestamp: number
}

interface GalleryData {
  items: GalleryItem[]
}

async function migrate() {
  try {
    // Read gallery data
    const galleryData = await readJsonFile(path.join(process.cwd(), 'lib/gallery.json'))
    
    console.log('Migrating gallery items...')
    for (const item of galleryData.items) {
      const { error } = await supabase
        .from('gallery')
        .upsert({
          id: item.id,
          album_id: item.albumId,
          type: item.type,
          url: item.url,
          thumbnail_url: item.thumbnailUrl,
          caption: item.caption || '',
          tagged_users: item.taggedUsers,
          uploaded_by: item.taggedUsers[0] || '1', // Use first tagged user as uploader, fallback to user 1
          created_at: new Date(item.uploadTimestamp).toISOString(),
          file_name: item.fileName,
          content_type: item.contentType
        })

      if (error) {
        console.error('Error migrating gallery item:', error)
        throw error
      }
    }

    console.log('Gallery migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
