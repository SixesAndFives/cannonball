import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import type { User } from '@/lib/types'

const USERS_PATH = path.join(process.cwd(), 'lib/users.json')

export async function GET() {
  try {
    const content = readFileSync(USERS_PATH, 'utf-8')
    const { users } = JSON.parse(content)
    
    // Return users without passwords
    const safeUsers = users.map((user: User) => {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
