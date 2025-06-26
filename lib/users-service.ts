import { supabase } from './supabase'
import type { User } from './types'

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, user_name, full_name, profile_image, instruments, created_at')
    .order('full_name')

  if (error) {
    console.error('Failed to get users:', error)
    return []
  }

  return users
}
