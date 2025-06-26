import type { User } from './types'

export async function login(user_name: string, password: string): Promise<Omit<User, 'password'>> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_name, password }),
  })

  if (!response.ok) {
    throw new Error('Invalid credentials')
  }

  return response.json()
}

// Function to get all users (without passwords) for the home page
export async function getUsers(): Promise<Omit<User, 'password'>[]> {
  const response = await fetch('/api/auth/users')
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}
