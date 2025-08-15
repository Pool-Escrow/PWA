# ORPC API with Hono Integration

This API is built using [ORPC](https://orpc.unnoq.com/) (Object Remote Procedure Call) with Hono as the web framework, following the [official ORPC Hono adapter documentation](https://orpc.unnoq.com/docs/adapters/hono).

## Architecture

### Core Components

- **`contracts.ts`** - ORPC procedure definitions with input/output schemas
- **`router.ts`** - ORPC router that combines all procedures
- **`handlers.ts`** - Business logic implementation for each procedure
- **`app.ts`** - Hono application with ORPC integration
- **`client.ts`** - ORPC client for frontend usage
- **`types.ts`** - Full type safety from contract to Zod schemas

### Key Features

1. **ORPC Compliance**: Follows the official ORPC specification with procedures, contracts, and type-safe RPC calls
2. **Full Type Safety**: End-to-end type safety from smart contracts to client calls
3. **Contract-First Design**: API contracts are defined first, then implemented
4. **Smart Contract Integration**: Direct integration with blockchain contracts using viem
5. **Validation**: Comprehensive input and output validation using Zod schemas
6. **Error Handling**: Proper error handling with ORPC error types

## API Procedures

### Health Check
```typescript
health.query() // Returns health status
```

### Pool Procedures
```typescript
getPool.query({ id: "84532:123" }) // Get complete pool data
getPoolDetails.query({ id: "84532:123" }) // Get pool details only
```

### Participant Procedures
```typescript
getParticipant.query({ 
  id: "84532:123", 
  address: "0x..." 
}) // Get participant details
```

### User Procedures
```typescript
getUserBalances.query({ address: "0x..." }) // Get user token balances
getUserRoles.query({ address: "0x..." }) // Get user roles
```

## Usage

### Server-Side (API Routes)
The ORPC API is available at `/api/rpc/*` and handles all procedure calls automatically.

### Client-Side
```typescript
import { client } from '@/lib/api/client'

// Get pool data
const poolData = await client.getPool.query({
  id: "84532:123"
})

// Get participant details
const participant = await client.getParticipant.query({
  id: "84532:123",
  address: "0x1234567890123456789012345678901234567890"
})

// Get user balances
const balances = await client.getUserBalances.query({
  address: "0x1234567890123456789012345678901234567890"
})
```

## Chain-Aware Pool IDs

Pool IDs support chain-aware format:
- `"123"` - Defaults to Base Sepolia (84532)
- `"84532:123"` - Explicit chain ID and pool ID
- `"8453:456"` - Base Mainnet pool

## Type Safety

The API ensures full type safety:

1. **Procedure Contracts**: Input/output schemas defined with Zod
2. **Business Logic**: Handlers implement the actual logic
3. **Client Integration**: TypeScript types are automatically inferred
4. **Runtime Validation**: All data is validated at runtime

## Error Handling

ORPC provides built-in error handling:
- **Validation Errors**: Automatic input validation
- **Business Logic Errors**: Custom error messages from handlers
- **Network Errors**: Proper error propagation
- **Type Safety**: Compile-time error checking

## Development

### Adding New Procedures

1. **Define Contract** in `contracts.ts`:
```typescript
export const newProcedure = procedure
  .input(InputSchema)
  .output(OutputSchema)
  .query(async ({ input }) => {
    return await handleNewProcedure(input)
  })
```

2. **Implement Handler** in `handlers.ts`:
```typescript
export async function handleNewProcedure(input: InputType) {
  // Business logic here
  return result
}
```

3. **Add to Router** in `router.ts`:
```typescript
export const procedures = {
  // ... existing procedures
  newProcedure,
} as const
```

### Testing

Test the ORPC API using the client:
```typescript
import { getHealth } from '@/lib/api/client'

const health = await getHealth()
console.log(health) // { status: 'healthy', timestamp: 1234567890, version: '1.0.0' }
```

### Local Development

The API runs as part of the Next.js application:
- **ORPC Endpoint**: `http://localhost:3000/api/rpc/*`
- **Health Check**: `http://localhost:3000/api/health`

## Migration from REST API

This replaces the previous REST API with:
- **Type Safety**: Full end-to-end type safety
- **ORPC Compliance**: Official ORPC specification
- **Better DX**: Improved developer experience
- **Contract-First**: API contracts defined before implementation
- **Performance**: Optimized RPC calls

## ORPC Benefits

- **Contract-First Design**: Define contracts, then implement
- **Type Safety**: Full TypeScript support
- **Error Handling**: Built-in error types and handling
- **Performance**: Optimized for RPC calls
- **Developer Experience**: Excellent DX with auto-completion
- **Validation**: Automatic input/output validation 