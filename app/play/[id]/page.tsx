import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { albums } from "@/lib/data"

export default function PlayPage({ params }: { params: { id: string } }) {
  const album = albums.find((a) => a.id === params.id)

  if (!album) {
    return <div className="container mx-auto p-4">Album not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to home</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Now Playing</h1>
            <p className="text-sm text-gray-500">
              {album.title} ({album.year})
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-lg text-gray-700 mb-4">This is a mock player page for demonstration purposes.</p>
          <p className="text-gray-500">In a real application, this would contain an audio player for {album.title}.</p>
        </div>
      </main>
    </div>
  )
}
