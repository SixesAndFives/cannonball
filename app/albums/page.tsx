import { SearchBar } from "@/components/search-bar"
import { AlbumGrid } from "@/components/album-grid"
import { getAllAlbums } from "@/lib/album-service"

export default async function AlbumsPage() {
  const albums = await getAllAlbums();
  return (
    <main className="container mx-auto px-4 py-6">
      <SearchBar />

      <div className="mt-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Albums</h2>
        <AlbumGrid albums={albums} />
      </div>
    </main>
  )
}
