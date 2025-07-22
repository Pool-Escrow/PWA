# Debug System Documentation

## Overview

We've implemented a comprehensive debug system to monitor and track requests in real-time, specifically designed to identify and prevent excessive API calls that can trigger rate limits.

## Key Features

### 1. Request Counter Debug Store (`src/stores/debug.store.ts`)

Tracks all requests made by components in real-time:

-   **Request Types**: `useBalance`, `useReadContract`, `fetch`, `other`
-   **Component Tracking**: Associates each request with the component that made it
-   **Metadata**: Includes token addresses, timestamps, and stack traces
-   **Performance Metrics**: Tracks render counts and timing

### 2. Debug Overlay (`src/components/debug-overlay.tsx`)

A draggable floating UI that displays:

-   **Total Requests**: Running count of all requests made
-   **Component Breakdown**: Shows requests per component
-   **Request Types**: Categorizes by hook/API type (useBalance, useReadContract, etc.)
-   **Warning System**: Alerts when request count exceeds thresholds
-   **Reset Functionality**: Clear counters during testing

### 3. Shared Balance Hook (`src/hooks/use-shared-balance.ts`)

Centralized balance management to prevent duplicate queries:

-   **Single Source**: One useBalance call for USDC and DROP tokens
-   **Shared Cache**: React Query caching across all components
-   **Request Tracking**: Automatically logs component usage
-   **Fallback Support**: Individual queries when shared cache unavailable

## How to Use

### Enable Debug Mode

1. Go to **Profile > Developer Mode Settings**
2. Enable "Developer Mode"
3. Enable "Show debug overlay (request monitor)"

### Monitor Requests

1. A blue floating button appears in bottom-right corner
2. Click to open the debug overlay
3. Watch real-time request counts by component
4. Drag the overlay to reposition it

### Debug Interface

```
┌─────────────────────────────────┐
│ 🔵 Debug Monitor           ↻ ✕ │
├─────────────────────────────────┤
│ Total Requests: 12              │
│ Renders: 8                      │
├─────────────────────────────────┤
│ PoolsBalance                  4 │
│   useBalance (USDC)           2 │
│   useBalance (DROP)           2 │
│                                 │
│ Balance                       3 │
│   useBalance (individual)     3 │
│                                 │
│ BottomBarHandler              5 │
│   useReadContract             5 │
└─────────────────────────────────┘
```

### Warning Indicators

-   **🟡 Yellow Numbers**: High request count for single component
-   **🔴 Red Warning**: Total requests > 50 (potential rate limit risk)
-   **⚠️ Alert Bar**: Appears at bottom when threshold exceeded

## Optimizations Implemented

### 1. Shared Balance System

**Before**: Each component called `useBalance` independently

```typescript
// ❌ Multiple duplicate calls
// PoolsBalance: useBalance(USDC) + useBalance(DROP)
// Balance: useBalance(USDC)
// ProfileBalance: useBalance(USDC)
// = 4 total balance requests
```

**After**: Centralized through `useSharedBalance`

```typescript
// ✅ Single shared call
// useSharedBalance: useBalance(USDC) + useBalance(DROP)
// All components share the same cached result
// = 2 total balance requests
```

### 2. Conditional Hook Execution

**Before**: Hooks ran even with invalid data

```typescript
// ❌ Always executed
useBalance({ address: undefined, token: undefined })
```

**After**: Guards prevent unnecessary calls

```typescript
// ✅ Only when data is valid
const canFetch = Boolean(address && token && isCorrectNetwork)
useBalance({
  address,
  token,
  query: { enabled: canFetch }
})
```

### 3. Polling Disabled

**Before**: Automatic refetching every few seconds

```typescript
// ❌ Constant polling
useBalance({
  query: {
    refetchInterval: 5000,  // Every 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true
  }
})
```

**After**: Manual refresh only

```typescript
// ✅ No automatic polling
useBalance({
  query: {
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 60_000,  // 1 minute cache
    gcTime: 300_000     // 5 minute retention
  }
})
```

## Troubleshooting

### High Request Count

1. **Check Component Breakdown**: Identify which component is making most requests
2. **Review Stack Traces**: Debug overlay shows call stack for each request
3. **Verify Conditions**: Ensure guards (`canFetch`, `enabled`) work properly
4. **Check Polling**: Verify `refetchInterval: false` is set

### Rate Limit Errors

1. **Monitor Total Requests**: Keep below 50 requests per page load
2. **Stagger Component Loading**: Use Suspense boundaries for gradual loading
3. **Increase Cache Times**: Higher `staleTime` and `gcTime` values
4. **Review RPC Endpoints**: Ensure using working endpoints only

### Debug Overlay Issues

1. **Not Visible**: Check developer mode is enabled in settings
2. **No Data**: Verify components are calling `trackRequest()`
3. **Performance**: Reset counters if numbers get too high

## Implementation Examples

### Adding Debug Tracking to New Component

```typescript
import { useDebugStore } from '@/stores/debug.store'

export function MyComponent() {
  const { trackRequest } = useDebugStore()

  // Track this component's request
  if (process.env.NODE_ENV === 'development' && canFetch) {
    trackRequest('MyComponent', 'useBalance', {
      token: 'USDC',
      address,
      stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
    })
  }

  const { data } = useBalance({
    // ... balance config
  })
}
```

### Using Shared Balance

```typescript
import { useSharedBalance } from '@/hooks/use-shared-balance'

export function MyBalanceComponent() {
  const { usdc, drop, isAnyLoading } = useSharedBalance('MyBalanceComponent')

  if (isAnyLoading) return <LoadingSkeleton />

  return (
    <div>
      <span>{usdc.formatted} USDC</span>
      <span>{drop.formatted} DROP</span>
    </div>
  )
}
```

## Performance Monitoring

### Before Optimizations

```
┌─────────────────────────────────┐
│ Total Requests: 87              │ ⚠️ HIGH
│ PoolsBalance                 24 │
│ Balance                      18 │
│ ProfileBalance               15 │
│ BottomBarHandler             30 │ ⚠️ EXCESSIVE
└─────────────────────────────────┘
```

### After Optimizations

```
┌─────────────────────────────────┐
│ Total Requests: 12              │ ✅ GOOD
│ PoolsBalance (shared)         2 │
│ Balance (shared)              1 │
│ UserPools                     3 │
│ UpcomingPools                 3 │
│ BottomBarHandler              3 │
└─────────────────────────────────┘
```

## Next Steps

1. **Monitor Production**: Watch request patterns in live environment
2. **Optimize Further**: Identify remaining high-frequency components
3. **Add More Tracking**: Extend to track API endpoint usage
4. **Automated Alerts**: Set up monitoring for rate limit approaches

## Support

If you see excessive requests or rate limit errors:

1. Enable debug overlay
2. Take screenshot of request breakdown
3. Check browser console for detailed stack traces
4. Share findings with development team

The debug system provides comprehensive insights into request patterns and helps maintain optimal performance while preventing rate limit issues.
