import { supabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, user_name, full_name, profile_image')
      .order('full_name');

    if (error) throw error;
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to get users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
