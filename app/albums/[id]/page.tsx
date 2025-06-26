// app/albums/[id]/page.tsx
import { Metadata, Viewport } from 'next'
import { getAlbumById } from "@/lib/album-service"
import { getAllUsers } from "@/lib/users-service"
import { AlbumDetailClient } from "@/app/albums/[id]/client"
import { getCurrentUser } from "@/lib/auth-service"
import type { Album, User } from "@/lib/types"

export const viewport: Viewport = {
  themeColor: '#ffffff'
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const album = await getAlbumById(id)
  
  return {
    title: album?.title || 'Album Details',
    description: `Details for album ${album?.title || ''}`,
  }
}

type UserWithoutPassword = Omit<User, 'password'>;

export default async function AlbumDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [album, users, currentUser] = await Promise.all([
    getAlbumById(id),
    getAllUsers(),
    getCurrentUser()
  ])
  return <AlbumDetailClient initialAlbum={album} users={users as UserWithoutPassword[]} currentUser={currentUser as UserWithoutPassword | null} />
}
