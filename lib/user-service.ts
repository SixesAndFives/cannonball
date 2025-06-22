import { promises as fs } from 'fs';
import path from 'path';
import type { User } from './types';

const usersPath = path.join(process.cwd(), 'lib', 'users.json');

export interface UsersData {
  users: User[];
}

export async function readUsersData(): Promise<UsersData> {
  try {
    const data = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users.json:', error);
    return { users: [] };
  }
}

export async function getAllUsers(): Promise<User[]> {
  const data = await readUsersData();
  return data.users;
}

export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  const data = await readUsersData();
  return data.users.filter(user => userIds.includes(user.id));
}
