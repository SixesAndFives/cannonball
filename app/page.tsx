import { HomeClient } from "./home-client"
import { headers } from 'next/headers'

// Mark this page as dynamic
export const dynamic = 'force-dynamic'

async function getUsers() {
  try {
    console.log('=== Fetching users ===', { NODE_ENV: process.env.NODE_ENV })
    
    const response = await fetch('/api/auth/users', {
      cache: 'no-store',
      method: 'GET'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Users API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched users:', {
      count: data.length,
      firstUser: data[0] ? { id: data[0].id, user_name: data[0].user_name } : null
    })
    return data
  } catch (err) {
    const error = err as Error
    console.error('Error fetching users:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    })
    return []
  }
}

export default async function Home() {
  const users = await getUsers();
  return <HomeClient users={users} />
}
