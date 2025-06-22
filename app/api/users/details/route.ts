import { getUsersByIds } from '@/lib/user-service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();
    const users = await getUsersByIds(userIds);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to get user details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
