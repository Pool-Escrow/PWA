import { blo } from 'blo'

/**
 * Generates a consistent avatar URL for a given address
 * Uses "blo" identicons for deterministic avatars
 */
export function generateAvatarUrl(address?: App.Address): string {
  if (address == null) {
    return blo('0x0')
  }

  const lowercased = address.toLowerCase() as `0x${string}`
  return blo(lowercased)
}
