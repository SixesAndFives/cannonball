"use client"

import { useState } from "react"
import Image from "next/image"
import { Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Album } from "@/lib/types"

interface AlbumHeaderProps {
  album: Album
  onUpdate: (updatedAlbum: Album) => void
}

export function AlbumHeader({ album, onUpdate }: AlbumHeaderProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(album.title)
  const [editedYear, setEditedYear] = useState(album.year?.toString() || "")
  const [editedPersonnel, setEditedPersonnel] = useState(album.personnel?.join("\n") || "")

  const handleSave = () => {
    const updatedAlbum = {
      ...album,
      title: editedTitle,
      year: editedYear ? parseInt(editedYear, 10) : undefined,
      personnel: editedPersonnel ? editedPersonnel.split("\n").filter(line => line.trim()) : undefined
    }
    
    onUpdate(updatedAlbum)
    setIsEditing(false)
    toast({
      title: "Album updated",
      description: "Album details have been saved successfully."
    })
  }

  const handleCancel = () => {
    setEditedTitle(album.title)
    setEditedYear(album.year?.toString() || "")
    setEditedPersonnel(album.personnel?.join("\n") || "")
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <div className="relative aspect-square">
        <Image
          src={album.coverImage || "/placeholder.svg"}
          alt={album.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4 space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Album Title
                </label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter album title"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Release Year
                </label>
                <Input
                  id="year"
                  type="number"
                  value={editedYear}
                  onChange={(e) => setEditedYear(e.target.value)}
                  placeholder="Enter release year"
                />
              </div>

              <div>
                <label htmlFor="personnel" className="block text-sm font-medium text-gray-700 mb-1">
                  Personnel
                </label>
                <Textarea
                  id="personnel"
                  value={editedPersonnel}
                  onChange={(e) => setEditedPersonnel(e.target.value)}
                  placeholder="Enter personnel (one per line)"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{album.title}</h2>
              <p className="text-sm text-gray-500">
                {album.year ? `Released in ${album.year}` : "Release date unknown"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {album.tracks.length} tracks
              </p>
            </div>

            {album.personnel && album.personnel.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Personnel</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {album.personnel.map((person, index) => (
                    <li key={index}>{person}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
              <Edit className="h-4 w-4 mr-1" />
              Edit Album Details
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
