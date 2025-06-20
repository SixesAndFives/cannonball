import { readFileSync } from 'fs'
import path from 'path'
import { HomeClient } from "./home-client"
import type { User } from '@/lib/types'

async function getUsers() {
  try {
    const usersPath = path.join(process.cwd(), 'lib/users.json')
    const content = readFileSync(usersPath, 'utf-8')
    const { users } = JSON.parse(content)
    return users.map((user: User) => {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    })
  } catch (error) {
    console.error('Error reading users:', error)
    return []
  }
}

export default async function Home() {
  const users = await getUsers();
  return <HomeClient users={users} />
}
