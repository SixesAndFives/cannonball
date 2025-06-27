import { HomeClient } from "./home-client"

async function getUsers() {
  try {
    // Use relative URL instead of absolute
    const response = await fetch('/api/auth/users', {
      cache: 'no-store' // Don't cache user list
    })
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function Home() {
  const users = await getUsers();
  return <HomeClient users={users} />
}
