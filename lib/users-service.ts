import { readFileSync } from 'fs'
import { join } from 'path'
import type { User } from './types'

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const usersPath = join(process.cwd(), 'lib', 'users.json')
  const usersData = JSON.parse(readFileSync(usersPath, 'utf-8'))
  
  return usersData.users.map(({ password, ...user }: User) => user)
}
