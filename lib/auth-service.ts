import { cookies } from 'next/headers'
import { getAllUsers } from './users-service'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    return null
  }

  const users = await getAllUsers()
  return users.find(user => user.id === userId) || null
}
