import { NextResponse } from 'next/server'
import type { User } from '@/lib/types'
import { supabase } from '@/lib/supabase/server'

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
      user_name: user.user_name,
      full_name: user.full_name,
      password: '', // We don't return passwords in the list
      profile_image: user.profile_image,
      instruments: user.instruments,
      created_at: user.created_at
    }))

    console.log('Raw users from DB:', users)
    console.log('Transformed users:', safeUsers)
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
