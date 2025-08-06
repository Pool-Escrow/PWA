#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function verifyIconBundle() {
  try {
    const bundlePath = join(__dirname, '../src/lib/icons/bundle.json')
    const bundle = JSON.parse(readFileSync(bundlePath, 'utf-8'))

    console.log('✅ Icon bundle verification:')
    console.log(`📦 Total icons: ${Object.keys(bundle).length}`)
    console.log('🎯 Icons included:')

    Object.keys(bundle).forEach((iconName, index) => {
      const icon = bundle[iconName]
      const hasBody = icon.body ? '✅' : '❌'
      const hasViewBox = icon.viewBox ? '✅' : '❌'
      console.log(`  ${index + 1}. ${iconName} - Body: ${hasBody} ViewBox: ${hasViewBox}`)
    })

    // Check for common issues
    const issues = []

    Object.entries(bundle).forEach(([name, icon]) => {
      if (!icon.body) {
        issues.push(`❌ ${name}: Missing SVG body`)
      }
      if (typeof icon.body !== 'string') {
        issues.push(`❌ ${name}: Invalid SVG body type`)
      }
      if (!icon.viewBox) {
        issues.push(`❌ ${name}: Missing viewBox`)
      }
      if (typeof icon.viewBox !== 'string') {
        issues.push(`❌ ${name}: Invalid viewBox type`)
      }
    })

    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:')
      issues.forEach(issue => console.log(`  ${issue}`))
      process.exit(1)
    }
    else {
      console.log('\n🎉 All icons verified successfully!')
    }
  }
  catch (error) {
    console.error('❌ Failed to verify icon bundle:', error.message)
    process.exit(1)
  }
}

verifyIconBundle()
