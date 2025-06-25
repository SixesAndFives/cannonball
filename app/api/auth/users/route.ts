import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, user_name, full_name, profile_image, instruments, created_at')

    if (error) {
      throw error
    }

    // Transform to match our User type
    const safeUsers = users.map(user => ({
      id: user.id,
      userName: user.user_name,
      fullName: user.full_name,
      password: '', // We don't return passwords in the list
      profileImage: user.profile_image,
      instruments: user.instruments,
      createdAt: user.created_at
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
