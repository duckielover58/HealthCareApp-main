// Client-side authentication service for static hosting
interface User {
  username: string
  isAuthenticated: boolean
}

const USERS_KEY = 'healthAppUsers'
const CURRENT_USER_KEY = 'healthAppCurrentUser'

export function registerUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
      
      if (users[username]) {
        resolve({ success: false, error: 'Username already exists' })
        return
      }
      
      // In a real app, you'd hash the password
      users[username] = { password, createdAt: new Date().toISOString() }
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      
      resolve({ success: true })
    } catch (error) {
      resolve({ success: false, error: 'Registration failed' })
    }
  })
}

export function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
      const user = users[username]
      
      if (!user || user.password !== password) {
        resolve({ success: false, error: 'Invalid username or password' })
        return
      }
      
      // Store current user
      const currentUser: User = { username, isAuthenticated: true }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
      
      resolve({ success: true })
    } catch (error) {
      resolve({ success: false, error: 'Login failed' })
    }
  })
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getCurrentUser(): User | null {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser()
  return user?.isAuthenticated || false
}
