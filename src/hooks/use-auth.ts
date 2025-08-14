'use client'

import { usePrivy } from '@privy-io/react-auth'

export function useAuth() {
  const { ready, authenticated, login, logout } = usePrivy()

  return {
    login,
    logout,
    authenticated: ready && authenticated,
    ready,
  }
}
