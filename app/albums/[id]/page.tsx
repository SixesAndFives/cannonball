// app/albums/[id]/page.tsx
import { getAlbumById } from "@/lib/album-service"
import { getAllUsers } from "@/lib/users-service"
import { AlbumDetailClient } from "@/app/albums/[id]/client"
import { getCurrentUser } from "@/lib/auth-service"
import type { Album, User } from "@/lib/types"

type UserWithoutPassword = Omit<User, 'password'>;

export default async function AlbumDetailPage(
  { params }: { params: { id: string } }
) {
  const id = params.id
  const [album, users, currentUser] = await Promise.all([
    getAlbumById(id),
    getAllUsers(),
    getCurrentUser()
  ])
  return <AlbumDetailClient initialAlbum={album} users={users as UserWithoutPassword[]} currentUser={currentUser as UserWithoutPassword | null} />
}
