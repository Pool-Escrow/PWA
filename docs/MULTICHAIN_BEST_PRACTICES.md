# Multichain Development Best Practices

## 🎯 **Overview**

This guide provides best practices for developing with the new optimized multichain architecture. Follow these guidelines to avoid rate limiting errors and maintain optimal performance.

## 🚫 **What NOT To Do**

### ❌ **Never use static contract addresses**

```typescript
// ❌ BAD - Static addresses
import { currentTokenAddress } from '@/server/blockchain/server-config'

const { data } = useBalance({
    token: currentTokenAddress, // ❌ Does not change when the user switches chain
    address,
})
```

### ❌ **Never use automatic polling**

```typescript
// ❌ BAD - Causes rate limiting
const { data } = useBalance({
    token: tokenAddress,
    address,
    query: {
        refetchInterval: 20_000, // ❌ Causes 12-18 calls per minute
    },
})
```

### ❌ **Never omit chainId in query keys**

```typescript
// ❌ BAD - Cache conflicts between chains
queryKey: ['balance', address], // ❌ Does not distinguish between chains
```

### ❌ **Never use non-existent parameters in hooks**

```typescript
// ❌ BAD - Parameters that do not exist
const { data } = useBalance({
    token: tokenAddress,
    address,
    chainId, // ❌ Does not exist in useBalance
    scopeKey, // ❌ Does not exist in useBalance
    watch, // ❌ Does not exist in useBalance
})
```

## ✅ **What TO Do**

### ✅ **Use chain-aware hooks**

```typescript
// ✅ GOOD - Dynamic addresses
import { useChainAwareContracts } from '@/hooks/use-chain-aware-contracts'

const { tokenAddress, poolAddress, chainId } = useChainAwareContracts()

const { data } = useBalance({
    token: tokenAddress, // ✅ Changes automatically with the chain
    address,
    query: {
        enabled: Boolean(address && tokenAddress),
    },
})
```

### ✅ **Use optimized cache configuration**

```typescript
// ✅ GOOD - Optimized cache for blockchain
const { data } = useBalance({
    token: tokenAddress,
    address,
    query: {
        staleTime: 60_000, // ✅ Fresh data for 1 minute
        gcTime: 300_000, // ✅ Cache for 5 minutes
        refetchInterval: false, // ✅ No automatic polling
        refetchOnWindowFocus: false, // ✅ No refetch on focus
        refetchOnMount: false, // ✅ No refetch on mount if data is fresh
        enabled: Boolean(address && tokenAddress), // ✅ Only run when necessary
    },
})
```

### ✅ **Include chainId in query keys**

```typescript
// ✅ GOOD - Cache isolation per chain
queryKey: ['balance', address, chainId], // ✅ Distinguishes between chains
```

### ✅ **Use server-side chain-aware operations**

```typescript
// ✅ GOOD - Dynamic server-side
import { getContractAddresses } from '@/server/blockchain/server-config'

export async function getPoolData(poolId: string, chainId: number) {
    const { poolAddress } = getContractAddresses(chainId) // ✅ Dynamic per chain

    return await publicClient.readContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getPool',
        args: [poolId],
    })
}
```

## 🔧 **Recommended Patterns**

### 1. **Hook Pattern for Balance**

```typescript
export function useTokenBalance(address?: Address) {
    const chainId = useChainId()
    const { tokenAddress } = useChainAwareContracts()

    return useBalance({
        token: tokenAddress,
        address,
        query: {
            staleTime: 60_000,
            gcTime: 300_000,
            refetchInterval: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            enabled: Boolean(address && tokenAddress),
        },
    })
}
```

### 2. **Hook Pattern for Contract Reads**

```typescript
export function usePoolDetails(poolId: string) {
    const chainId = useChainId()
    const { poolAddress } = useChainAwareContracts()

    return useReadContract({
        abi: poolAbi,
        address: poolAddress,
        functionName: 'getPool',
        args: [poolId],
        query: {
            queryKey: ['poolDetails', poolId, chainId], // ✅ Include chainId
            staleTime: 60_000,
            gcTime: 300_000,
            refetchInterval: false,
            enabled: Boolean(poolId && poolAddress),
        },
    })
}
```

### 3. **Server Action Pattern**

```typescript
export async function getPoolParticipants(poolId: string, chainId: number) {
    const { poolAddress } = getContractAddresses(chainId)
    const client = getServerClientForChain(chainId)

    return await client.readContract({
        address: poolAddress,
        abi: poolAbi,
        functionName: 'getParticipants',
        args: [poolId],
    })
}
```

## 🚨 **Rate Limiting Prevention Checklist**

### ✅ **Before deploying**

-   [ ] All hooks use `refetchInterval: false`
-   [ ] All query keys include `chainId`
-   [ ] All contract addresses are dynamic
-   [ ] Cache settings are configured (60s staleTime, 5min gcTime)
-   [ ] No non-existent parameters in wagmi hooks
-   [ ] Error handling is implemented for 429 errors

### ✅ **Testing checklist**

-   [ ] Chain switching works correctly
-   [ ] Balances update when changing chain
-   [ ] No console errors related to wagmi
-   [ ] Cache works correctly (no unnecessary refetch)
-   [ ] Rate limiting does not occur during normal use

## 📊 **Monitoring & Debugging**

### **Console Logs in Development**

```typescript
// The current configuration shows useful logs in development:
// [wagmi-config] Chain configuration: { environment: 'development', ... }
// [server-config] Chain configuration: { environment: 'development', ... }
```

### **Rate Limiting Detection**

```typescript
// React Query automatically detects rate limiting:
// "Rate limit detected, not retrying: 429 Too Many Requests"
```

### **Performance Monitoring**

```typescript
// Monitor RPC calls in dev tools:
// Network tab → Filter by "POST" → Check call frequency
```

## 🔄 **Migration Checklist**

### **For existing components:**

1. [ ] Replace static imports with `useChainAwareContracts()`
2. [ ] Add `chainId` to query keys
3. [ ] Configure optimized cache settings
4. [ ] Remove automatic `refetchInterval`
5. [ ] Add proper error handling
6. [ ] Test on multiple chains

### **For new components:**

1. [ ] Use chain-aware hooks from the start
2. [ ] Follow established patterns
3. [ ] Include proper TypeScript types
4. [ ] Implement error boundaries
5. [ ] Test multichain from development

## 🎯 **Performance Goals**

### **Target Metrics:**

-   **RPC calls**: Maximum 6 per minute
-   **Cache hit rate**: Minimum 80%
-   **Chain switch time**: < 500ms
-   **Error rate**: 0% rate limiting errors

### **Monitoring:**

-   Use React DevTools Profiler for performance
-   Monitor Network tab for RPC frequency
-   Check console logs for warnings/errors
-   Regular testing on different chains

## 🔗 **Additional Resources**

-   [Wagmi Hooks Documentation](https://wagmi.sh/react/hooks)
-   [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
-   [Viem Client Configuration](https://viem.sh/docs/clients/public.html)
-   [Base Network Documentation](https://docs.base.org/)

---

**Remember**: Always prioritize user experience and system stability. When in doubt, choose the most conservative option in terms of rate limiting.
