# RPC Optimization Strategy

## Problem Statement

The application was experiencing HTTP 429 (Too Many Requests) errors due to excessive RPC calls, particularly when using the default Infura endpoints. This was caused by:

1. **Static chain configuration**: Server-side code used hardcoded chain configurations that didn't respond to user chain switches
2. **Aggressive polling**: `useBalance` hooks with 20-second intervals without proper caching
3. **No batch optimization**: Individual RPC calls instead of batched requests
4. **Poor cache management**: React Query wasn't optimized for blockchain data patterns

## Solutions Implemented

### 1. Chain-Aware Architecture

**Created `useChainAwareContracts` hook:**

-   Dynamically provides contract addresses based on current chain
-   Ensures all contract interactions use the correct addresses
-   Updates automatically when users switch chains

**Updated hooks to be chain-aware:**

-   `useIsAdmin`: Now checks admin status on the current chain
-   `useUpcomingPools`: Includes chainId in query keys
-   `useUserData`: Provides chain-specific user data

### 2. RPC Endpoint Optimization

**Fallback strategy in `wagmi.config.ts` and `server-config.ts`:**

1. **Environment variables first**: Use custom RPC URLs (Alchemy, Infura with API keys)
2. **Public nodes fallback**: Use `publicnode.com` endpoints (higher rate limits, no API key required)
3. **Viem defaults last resort**: Only use built-in endpoints as final fallback

**Endpoints used:**

-   Base Mainnet: `https://base.publicnode.com`
-   Base Sepolia: `https://base-sepolia.publicnode.com`

### 3. Batch and Multicall Optimization

**Wagmi configuration improvements:**

```typescript
batch: {
    multicall: {
        wait: 100, // Wait 100ms before sending multicall
        batchSize: 50, // Limit multicall batch size
    },
}
```

**HTTP transport optimization:**

```typescript
http(rpcUrl, {
    timeout: 15_000, // Increased timeout
    retryCount: 2, // Reduced retries to avoid rate limiting
    retryDelay: 1000, // Add delay between retries
    batch: {
        wait: 50, // Batch HTTP requests
        batchSize: 25, // Limit batch size
    },
})
```

### 4. React Query Cache Optimization

**Global defaults in `query.tsx`:**

-   `staleTime: 30_000`: Data considered fresh for 30 seconds
-   `gcTime: 60_000`: Keep data in cache for 1 minute
-   `refetchOnWindowFocus: false`: Prevent unnecessary refetches
-   `refetchOnMount: false`: Don't refetch if we have fresh data
-   Smart retry logic: Don't retry on 429 errors

**Hook-specific optimizations:**

-   `useBalance`: Added scope keys, reduced polling frequency
-   `useUpcomingPools`: 2-minute refetch interval instead of 30 seconds
-   Chain-aware query keys: `['pools', chainId]` ensures proper cache invalidation

### 5. Error Handling and Monitoring

**Rate limit detection:**

```typescript
retry: (failureCount, error) => {
    if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        return false // Don't retry rate-limited requests
    }
    return failureCount < 2
}
```

## Performance Improvements

### Before Optimization:

-   ❌ HTTP 429 errors within seconds
-   ❌ Static chain configuration causing stale data
-   ❌ Aggressive 20-second polling on all balance hooks
-   ❌ Individual RPC calls for each contract read

### After Optimization:

-   ✅ No rate limiting with public endpoints
-   ✅ Dynamic chain-aware data fetching
-   ✅ Intelligent caching with 30s-2min intervals
-   ✅ Batched and multicall optimizations
-   ✅ Proper error handling and retry logic

## Best Practices Implemented

1. **Query Key Strategy**: Include `chainId` in all blockchain-related query keys
2. **Stale Time Management**: Balance between fresh data and API efficiency
3. **Fallback Endpoints**: Always have backup RPC providers
4. **Batch Operations**: Group related blockchain calls
5. **Error Boundaries**: Handle rate limiting gracefully
6. **Cache Invalidation**: Proper cleanup when switching chains

## Monitoring and Debugging

For development debugging, you can add RPC request logging:

```typescript
// In development only
if (process.env.NODE_ENV === 'development') {
    console.log('[RPC Request]', method, params)
}
```

## Environment Variables

Set these for custom RPC endpoints with higher rate limits:

```env
NEXT_PUBLIC_RPC_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_RPC_BASE_SEPOLIA=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Future Considerations

1. **WebSocket connections** for real-time data instead of polling
2. **Local RPC caching** with Redis for server-side operations
3. **GraphQL endpoints** for complex blockchain queries
4. **Rate limiting middleware** to prevent client-side abuse
