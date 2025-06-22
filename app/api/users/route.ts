import { getAllUsers } from '@/lib/user-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to get users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
