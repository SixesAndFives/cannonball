import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Raw request body:', body)
    const { userName, password } = body
    console.log('Login attempt:', { userName, password })

    // Debug: Get all users first
    const { data: allUsers } = await supabase
      .from('users')
      .select('user_name')
    console.log('All usernames:', allUsers)

    // Try to find user with exact username match
    console.log('Looking for user_name exactly matching:', userName)
    const { data: foundUser, error: userError } = await supabase
      .from('users')
      .select('id, user_name, password')
      .eq('user_name', userName)

    console.log('Found user query:', { userName })
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
      userName: fullUser.user_name,
      fullName: fullUser.full_name,
      password: fullUser.password,
      profileImage: fullUser.profile_image,
      instruments: fullUser.instruments,
      createdAt: fullUser.created_at
    }

    const response = NextResponse.json(user)
    response.cookies.set('userId', user.id)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
