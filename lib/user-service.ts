import { supabase } from './supabase';
import type { User } from './types';

export async function getAllUsers(): Promise<User[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, user_name, full_name, profile_image, created_at')
    .order('full_name');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return users as User[];
}

export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, user_name, full_name, profile_image, created_at')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching users by ids:', error);
    return [];
  }

  return users as User[];
}
