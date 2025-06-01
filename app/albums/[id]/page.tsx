// app/albums/[id]/page.tsx
import { getAlbumById } from "@/lib/album-service"
import { AlbumDetailClient } from "@/app/albums/[id]/client"
import type { Album } from "@/lib/types"

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const id = await params.id
  const album = await getAlbumById(id)
  return <AlbumDetailClient initialAlbum={album} />
}
