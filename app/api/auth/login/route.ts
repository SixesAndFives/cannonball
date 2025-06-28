import { NextResponse } from 'next/server'
import type { User } from '@/lib/types'
import { supabase } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('=== Starting login request ===');
    console.log('Environment check:', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
      NODE_ENV: process.env.NODE_ENV
    })
    console.log('Raw request body:', body)
    
    // Handle both camelCase and snake_case field names
    const user_name = body.user_name || body.userName
    const { password } = body
    
    if (!user_name || !password) {
      console.error('Missing credentials:', { user_name, password })
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    
    console.log('Login attempt:', { user_name, password })

    // Debug: Get all users first
    const { data: allUsers } = await supabase
      .from('users')
      .select('user_name')
    console.log('Found usernames count:', allUsers?.length)
    console.log('Sample of usernames:', allUsers?.slice(0, 3))

    // Try to find user with exact username match
    console.log('Looking for user_name exactly matching:', user_name)
    const { data: foundUser, error: userError } = await supabase
      .from('users')
      .select('id, user_name, password')
      .eq('user_name', user_name)

    console.log('Found user query:', { user_name })
    console.log('Found user result:', foundUser)
    if (userError) console.log('User error:', userError)

    if (!foundUser || foundUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const matchedUser = foundUser[0]
    console.log('Comparing passwords:', {
      provided: password,
      stored: matchedUser.password
    })
    
    if (matchedUser.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Get full user data
    const { data: fullUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', matchedUser.id)
      .single()

    if (!fullUser) {
      return NextResponse.json({ error: 'User data not found' }, { status: 401 })
    }

    // Transform to match our User type
    const user: User = {
      id: fullUser.id,
      user_name: fullUser.user_name,
      full_name: fullUser.full_name,
      password: fullUser.password,
      profile_image: fullUser.profile_image,
      instruments: fullUser.instruments,
      created_at: fullUser.created_at
    }

    const response = NextResponse.json(user)
    response.cookies.set('userId', user.id)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
