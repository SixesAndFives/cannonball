import Link from "next/link"
import { SearchBar } from "@/components/search-bar"
import { AlbumGrid } from "@/components/album-grid"
import { getAllAlbums } from "@/lib/album-service"

export default async function Home() {
  const albums = await getAllAlbums();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="block">
              <h1 className="text-2xl font-semibold text-gray-900">Cannonball</h1>
              <p className="text-sm text-gray-500">Private Music Archive</p>
            </Link>
            <nav className="space-x-4 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <span className="text-gray-300">|</span>
              <Link href="/" className="text-gray-600 hover:text-gray-900">Albums</Link>
              <span className="text-gray-300">|</span>
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900">Gallery</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <SearchBar />

        <div className="mt-8">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Albums</h2>
          <AlbumGrid albums={albums} />
        </div>
      </main>
    </div>
  )
}
