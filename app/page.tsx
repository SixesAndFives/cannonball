import { HomeClient } from "./home-client"

async function getUsers() {
  try {
    // Use absolute URL
    const response = await fetch('http://localhost:3000/api/auth/users', {
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
