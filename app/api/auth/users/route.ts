import { NextResponse } from 'next/server'
import type { User } from '@/lib/types'
import { supabase } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'

export async function GET() {
  console.log('=== Starting users API request ===')
  try {
    // First try a simple count to test access
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Failed to count users:', countError)
      // Check specifically for permission errors
      if (countError.code === 'PGRST116') {
        console.error('This appears to be an RLS policy issue - no access to users table')
        return NextResponse.json({ error: 'Database access denied' }, { status: 403 })
      }
    }

    console.log('Users table access check - count:', count)

    // Now try to get the actual users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, user_name, full_name, profile_image, instruments, created_at')

    if (error) {
      const pgError = error as PostgrestError
      console.error('Supabase query error:', {
        message: pgError.message,
        code: pgError.code,
        details: pgError.details,
        hint: pgError.hint
      })

      // Check for common Postgres/RLS errors
      if (pgError.code === '42501') {
        return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
      }
      if (pgError.code?.startsWith('PGRST')) {
        return NextResponse.json({ error: 'PostgREST error: ' + pgError.message }, { status: 403 })
      }
      throw error
    }

    console.log('Query successful, raw user count:', users?.length || 0)
    console.log('Raw users from DB:', JSON.stringify(users, null, 2))

    if (!users || users.length === 0) {
      console.warn('No users found in database')
      return NextResponse.json([])
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

    console.log('Transformed users:', JSON.stringify(safeUsers, null, 2))
    console.log('=== Users API request completed successfully ===')
    return NextResponse.json(safeUsers)
  } catch (err) {
    const error = err as Error
    console.error('Critical error in users API:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    console.log('=== Users API request failed ===')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
