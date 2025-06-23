import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import type { User } from '@/lib/types'

const USERS_PATH = path.join(process.cwd(), 'lib/users.json')

export async function POST(request: Request) {
  try {
    const { userName, password } = await request.json()
    const content = readFileSync(USERS_PATH, 'utf-8')
    const { users } = JSON.parse(content)
    
    const user = users.find((u: User) => u.userName === userName && u.password === password)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Remove password and set cookie
    const { password: _, ...userWithoutPassword } = user
    const response = NextResponse.json(userWithoutPassword)
    response.cookies.set('userId', user.id)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
