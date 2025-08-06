/**
 * Generates a consistent avatar URL for a given address
 * Using DiceBear API for consistent avatars
 */
export function generateAvatarUrl(address?: App.Address): string {
  if (address == null) {
    return ''
  }

  // Use the address as seed for consistent avatars
  const seed = address.toLowerCase()
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=fff`
}

/**
 * Generates initials from an address (first 2 characters after 0x)
 * Currently unused but keeping for future use
 */
// export function getAddressInitials(address: Address): string {
//     return address.slice(2, 4).toUpperCase()
// }
