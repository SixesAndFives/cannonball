import { createClient } from '@supabase/supabase-js'

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

export async function getAllComments(): Promise<CommentWithAlbum[]> {
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
  
  albums?.forEach(album => {
    const comments = album.comments as any[]
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

  // Sort by timestamp, newest first
  return allComments.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}
