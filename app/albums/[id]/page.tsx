// app/albums/[id]/page.tsx
import { getAlbumById } from "@/lib/album-service"
import { getAllUsers } from "@/lib/users-service"
import { AlbumDetailClient } from "@/app/albums/[id]/client"
import type { Album } from "@/lib/types"

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [album, users] = await Promise.all([
    getAlbumById(id),
    getAllUsers()
  ])
  return <AlbumDetailClient initialAlbum={album} users={users} currentUser={null} />
}
