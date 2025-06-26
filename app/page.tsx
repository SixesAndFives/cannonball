import { HomeClient } from "./home-client"

async function getUsers() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const url = new URL('/api/auth/users', baseUrl)
    const response = await fetch(url, {
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
