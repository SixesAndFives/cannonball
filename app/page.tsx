import { HomeClient } from "./home-client"

async function getUsers() {
  try {
    // In Next.js server components, we need to use absolute URLs
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const host = process.env.VERCEL_URL || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const url = `${baseUrl}/api/auth/users`
    
    console.log('Fetching users from:', url)
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      protocol,
      host,
      baseUrl
    })
    
    const response = await fetch(url, {
      cache: 'no-store' // Don't cache user list
    })

    if (!response.ok) {
      console.error('Failed to fetch users:', {
        status: response.status,
        statusText: response.statusText
      })
      const errorText = await response.text()
      console.error('Error response:', errorText)
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
