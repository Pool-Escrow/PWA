#!/usr/bin/env bun

import { createHash } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { locate } from '@iconify/json'
import { getIconData, iconToSVG, quicklyValidateIconSet } from '@iconify/utils'

// Paths
const ICONS_SRC = join(import.meta.dirname, '../src/components/ui/icon.tsx')
const SPRITE_OUT = join(import.meta.dirname, '../public/icons/sprite.svg')
const HASH_FILE = join(import.meta.dirname, '../.next/icons-hash.txt')

// Extract icon names from ICON_MAP
function extractIconNames(): Set<string> {
  const src = readFileSync(ICONS_SRC, 'utf-8')
  const matches = [...src.matchAll(/'([\w-]+:[\w-]+)'/g)]
  return new Set(matches.map(m => m[1]))
}

// Generate content hash for icons
function generateContentHash(iconNames: Set<string>): string {
  const sortedNames = Array.from(iconNames).sort()
  const content = sortedNames.join(',')
  return createHash('sha256').update(content).digest('hex').substring(0, 8)
}

// Check if regeneration is needed
function shouldRegenerate(iconNames: Set<string>): { needed: boolean, reason: string } {
  if (!existsSync(SPRITE_OUT)) {
    return { needed: true, reason: 'sprite missing' }
  }

  const currentHash = generateContentHash(iconNames)

  // Check stored hash
  if (existsSync(HASH_FILE)) {
    const storedHash = readFileSync(HASH_FILE, 'utf-8').trim()
    if (storedHash === currentHash) {
      return { needed: false, reason: 'up to date' }
    }
    return { needed: true, reason: 'icons changed' }
  }

  return { needed: true, reason: 'no hash found' }
}

// Load icons from a collection
function loadIcons(prefix: string, iconNames: string[]): string[] {
  try {
    const rawData = JSON.parse(readFileSync(locate(prefix), 'utf-8')) as unknown
    const iconSet = quicklyValidateIconSet(rawData)
    if (!iconSet || typeof iconSet !== 'object')
      return []

    return iconNames.flatMap((fullName) => {
      const [, iconName] = fullName.split(':')
      const iconData = getIconData(iconSet, iconName)
      if (!iconData)
        return []

      const svgData = iconToSVG(iconData)
      return `  <symbol id="${fullName}" viewBox="${svgData.attributes.viewBox || '0 0 24 24'}">\n    ${svgData.body}\n  </symbol>`
    })
  }
  catch {
    return []
  }
}

// Generate optimized sprite
function generateSprite() {
  const iconNames = extractIconNames()

  if (iconNames.size === 0) {
    console.error('❌ No icons found in ICON_MAP')
    return
  }

  const { needed, reason } = shouldRegenerate(iconNames)
  console.log(`🔧 Icons: ${iconNames.size} total (${reason})`)

  if (!needed) {
    console.log('⏭️  Skipping generation - sprite is up to date')
    return
  }

  // Group by prefix and process
  const groups = new Map<string, string[]>()
  for (const name of iconNames) {
    const prefix = name.split(':')[0]
    groups.set(prefix, [...(groups.get(prefix) || []), name])
  }

  const symbols: string[] = []
  for (const [prefix, names] of groups) {
    symbols.push(...loadIcons(prefix, names))
  }

  if (symbols.length === 0) {
    console.error('❌ Failed to process any icons')
    return
  }

  // Write sprite
  const sprite = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
  <defs>
${symbols.sort().join('\n\n')}
  </defs>
</svg>
`

  mkdirSync(dirname(SPRITE_OUT), { recursive: true })
  writeFileSync(SPRITE_OUT, sprite)

  // Save content hash
  const currentHash = generateContentHash(iconNames)
  mkdirSync(dirname(HASH_FILE), { recursive: true })
  writeFileSync(HASH_FILE, currentHash)

  console.log(`✅ Generated sprite: ${symbols.length} icons`)
}

generateSprite()
