import { AlbumGrid } from "@/components/album-grid"
import { getAllAlbums } from "@/lib/album-service"

export default async function AlbumsPage() {
  const albums = await getAllAlbums();
  return (
    <main className="container mx-auto px-4 py-4">
      <AlbumGrid albums={albums} />
    </main>
  )
}
