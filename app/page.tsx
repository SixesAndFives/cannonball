import { HomeClient } from "./home-client"
import { headers } from 'next/headers'

// Mark this page as dynamic
export const dynamic = 'force-dynamic'

async function getUsers() {
  try {
    // Determine if we're running on server or client
    const isServer = typeof window === 'undefined'
    
    console.log('=== Fetching users ===', {
      environment: isServer ? 'server-side' : 'client-side',
      nodeEnv: process.env.NODE_ENV
    })
    
    // Get the protocol and host from headers when server-side
    const headersList = await headers()
    const protocol = process.env.NODE_ENV === 'development' ? 'http:' : 'https:'
    const host = headersList.get('host') || 'localhost:3000'
    
    // Construct full URL for server-side, relative for client-side
    const url = isServer ? `${protocol}//${host}/api/auth/users` : '/api/auth/users'
    
    console.log('Making request to:', url)
    
    const response = await fetch(url, {
      cache: 'no-store',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Users API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url
      })
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched users:', {
      count: data.length,
      firstUser: data[0] ? { id: data[0].id, user_name: data[0].user_name } : null,
      url
    })
    return data
  } catch (err) {
    const error = err as Error
    console.error('Error fetching users:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      environment: typeof window === 'undefined' ? 'server-side' : 'client-side'
    })
    return []
  }
}

export default async function Home() {
  const users = await getUsers();
  return <HomeClient users={users} />
}
