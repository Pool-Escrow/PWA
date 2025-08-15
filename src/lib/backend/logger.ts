/**
 * Enhanced Winston Logger for Hono
 * Type-safe logging with chain awareness, structured output, and better formatting
 */

import { env } from '@/lib/env/server'

// Log levels with priority (lower = higher priority)
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const

type LogLevel = keyof typeof LOG_LEVELS

// Metadata interfaces
interface BaseMetadata {
  chainId?: number
  [key: string]: unknown
}

interface HttpMetadata extends BaseMetadata {
  method?: string
  url?: string
  status?: number
  responseTime?: number
}

interface ChainLogger {
  info: (message: string, chainId?: number, metadata?: BaseMetadata) => void
  warn: (message: string, chainId?: number, metadata?: BaseMetadata) => void
  error: (message: string, error?: Error, chainId?: number, metadata?: BaseMetadata) => void
  http: (message: string, chainId?: number, metadata?: HttpMetadata) => void
  debug: (message: string, chainId?: number, metadata?: BaseMetadata) => void
}

// Current log level based on environment
const currentLogLevel = env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.info

// Helper to check if log level should be output
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= currentLogLevel
}

// Format timestamp
function formatTimestamp(): string {
  return new Date().toISOString().substring(11, 23) // HH:mm:ss.sss
}

// Enhanced console colors for different log levels
const COLORS = {
  error: '\x1B[38;2;239;68;68m', // Red
  warn: '\x1B[38;2;245;158;11m', // Amber
  info: '\x1B[38;2;59;130;246m', // Blue
  http: '\x1B[38;2;168;85;247m', // Purple
  debug: '\x1B[38;2;107;114;128m', // Gray
  reset: '\x1B[0m',
  bold: '\x1B[1m',
  dim: '\x1B[2m',
} as const

// Format log message for console with better visual hierarchy
function formatMessage(level: LogLevel, message: string, chainId?: number, metadata?: BaseMetadata): string {
  const timestamp = formatTimestamp()
  const color = env.NODE_ENV === 'production' ? '' : COLORS[level]
  const reset = env.NODE_ENV === 'production' ? '' : COLORS.reset
  const bold = env.NODE_ENV === 'production' ? '' : COLORS.bold
  const dim = env.NODE_ENV === 'production' ? '' : COLORS.dim
  
  const levelStr = bold + level.toUpperCase().padEnd(5) + reset
  const chainStr = chainId !== undefined && chainId > 0 
    ? dim + ` [Chain:${chainId}]` + reset 
    : ''

  if (env.NODE_ENV === 'production') {
    // JSON format for production
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'pool-api',
      environment: env.NODE_ENV,
      ...(chainId !== undefined && { chainId }),
      ...metadata,
    }
    return JSON.stringify(logData)
  }
  else {
    // Human readable format for development with better visual hierarchy
    const metaStr = metadata && Object.keys(metadata).length > 0
      ? dim + ` ${JSON.stringify(metadata)}` + reset
      : ''
    
    return `${dim}${timestamp}${reset} ${color}${levelStr}${reset}${chainStr} ${message}${metaStr}`
  }
}

// Enhanced console-based logger with reduced verbosity
export const chainLogger: ChainLogger = {
  info: (message: string, chainId?: number, metadata?: BaseMetadata) => {
    if (shouldLog('info')) {
      // Skip verbose balance fetching logs in development
      if (env.NODE_ENV === 'development' && message.includes('User balances fetched successfully')) {
        return
      }
      
      // eslint-disable-next-line no-console
      console.log(formatMessage('info', message, chainId, metadata))
    }
  },

  warn: (message: string, chainId?: number, metadata?: BaseMetadata) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, chainId, metadata))
    }
  },

  error: (message: string, error?: Error, chainId?: number, metadata?: BaseMetadata) => {
    if (shouldLog('error')) {
      const errorMetadata: BaseMetadata = { ...metadata }

      if (error) {
        errorMetadata.error = error.message
        // Only include stack trace in development
        if (env.NODE_ENV === 'development') {
          errorMetadata.stack = error.stack
        }
      }

      console.error(formatMessage('error', message, chainId, errorMetadata))
    }
  },

  http: (message: string, chainId?: number, metadata?: HttpMetadata) => {
    if (shouldLog('http')) {
      // Skip verbose HTTP logs for balance endpoints in development
      if (env.NODE_ENV === 'development' && metadata?.url?.includes('/balances')) {
        return
      }
      
      // eslint-disable-next-line no-console
      console.log(formatMessage('http', message, chainId, metadata))
    }
  },

  debug: (message: string, chainId?: number, metadata?: BaseMetadata) => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(formatMessage('debug', message, chainId, metadata))
    }
  },
}

// Export types
export type { BaseMetadata, ChainLogger, HttpMetadata, LogLevel }

// Simple default logger object for compatibility
const logger = {
  info: chainLogger.info,
  warn: chainLogger.warn,
  error: chainLogger.error,
  http: chainLogger.http,
  debug: chainLogger.debug,
}

export default logger
