import { supabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, user_name, full_name, profile_image')
      .in('id', userIds);

    if (error) throw error;
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to get user details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
