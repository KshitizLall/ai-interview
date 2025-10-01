const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

export interface SignupPayload {
  email: string
  password: string
  name?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

class AuthService {
  baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  async signup(payload: SignupPayload): Promise<TokenResponse> {
    const res = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Signup failed' }))
      throw new Error(err.detail || 'Signup failed')
    }

    return res.json()
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(err.detail || 'Login failed')
    }

    return res.json()
  }

  async logout(token: string): Promise<void> {
    await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }
}

export const authService = new AuthService()
