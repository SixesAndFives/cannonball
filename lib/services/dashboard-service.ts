import { createClient } from '@supabase/supabase-js'
import type { Comment, Album, GalleryItem } from '@/lib/types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface CommentWithAlbum {
  id: string
  author: string
  userId?: string
  content: string
  timestamp: string
  profileImage?: string
  album: {
    id: string
    title: string
    cover_image: string
  }
}

export async function getRecentGalleryItems(): Promise<GalleryItem[]> {
  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, gallery')
    .not('gallery', 'eq', '[]')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching albums with gallery:', error)
    return []
  }

  // Process and flatten gallery items from all albums
  const allItems: GalleryItem[] = []
  
  albums?.forEach(album => {
    const items = album.gallery as GalleryItem[]
    items.forEach(item => {
      allItems.push({
        ...item,
        album_id: album.id
      })
    })
  })

  // Sort by timestamp and take the 8 most recent
  return allItems
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
}

export async function getRecentAlbums(): Promise<Album[]> {
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching recent albums:', error)
    return []
  }

  return albums || []
}

export async function getRecentComments(): Promise<CommentWithAlbum[]> {
  console.log('Fetching albums with comments...')
  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, title, cover_image, comments')
    .not('comments', 'eq', '[]')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching albums with comments:', error)
    return []
  }

  // Process and flatten comments from all albums
  const allComments: CommentWithAlbum[] = []
  
  console.log('Albums data:', albums)
  albums?.forEach(album => {
    const comments = album.comments as any[]
    console.log('Album comments:', comments)
    comments.forEach(comment => {
      // Use timestamp if available, otherwise try created_at, or undefined if neither exists
      const timestamp = comment.timestamp || comment.created_at
      
      allComments.push({
        id: comment.id,
        author: comment.author,
        userId: comment.user_id,
        content: comment.content,
        timestamp: timestamp,
        profileImage: comment.profile_image,
        album: {
          id: album.id,
          title: album.title,
          cover_image: album.cover_image
        }
      })
    })
  })

  // Sort by timestamp and take the 10 most recent
  return allComments
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}
