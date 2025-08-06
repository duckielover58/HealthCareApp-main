import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory user store (in production, use a database)
const users = new Map<string, { password: string; history: any[] }>()

export async function POST(request: NextRequest) {
  try {
    const { action, username, password } = await request.json()

    if (action === 'register') {
      if (users.has(username)) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
      }

      users.set(username, { password, history: [] })
      
      // Set session cookie
      const response = NextResponse.json({ success: true, message: 'Account created successfully' })
      response.cookies.set('session', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    }

    if (action === 'login') {
      const user = users.get(username)
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Set session cookie
      const response = NextResponse.json({ success: true, message: 'Logged in successfully' })
      response.cookies.set('session', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
      response.cookies.delete('session')
      return response
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')
    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    const user = users.get(session.value)
    if (!user) {
      const response = NextResponse.json({ authenticated: false })
      response.cookies.delete('session')
      return response
    }

    return NextResponse.json({ 
      authenticated: true, 
      username: session.value,
      historyCount: user.history.length
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
} 