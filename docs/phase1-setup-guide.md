# Phase 1 Setup Guide: Goldsky + Neon Migration

This guide walks you through setting up the infrastructure for Phase 1 of the migration from Supabase to Goldsky Mirror + Neon.

## 📋 Prerequisites

-   [ ] Access to [Neon Console](https://console.neon.tech)
-   [ ] Access to [Goldsky Platform](https://goldsky.com)
-   [ ] Pool contract deployed on Base Sepolia (✅ Done: `0x5C22662210E48D0f5614cACA6f7a6a938716Ea26`)
-   [ ] tunnelmole tunneling tool for local webhook testing
-   [ ] Node.js 22.x and pnpm

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project named "pool-pwa-goldsky"
3. Select region closest to your users (US East recommended)
4. Copy the connection string

### 1.2 Run Database Schema

```bash
# Connect to your Neon database
psql "your-neon-connection-string-here"

# Run the schema creation
\i neon-schema.sql

# Verify tables were created
\dt

# Check indexes
\di
```

### 1.3 Verify Database Setup

```sql
-- Test the database
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
```

## 🔗 Step 2: Deploy Goldsky Subgraph

### 2.1 Install Goldsky CLI

```bash
# Install Goldsky CLI
npm install -g @goldsky/cli

# Login to Goldsky
goldsky login
```

### 2.2 Initialize Subgraph Project

```bash
# Create subgraph directory
mkdir goldsky-pool-subgraph
cd goldsky-pool-subgraph

# Copy the configuration files
cp ../goldsky-subgraph.yaml subgraph.yaml
cp ../goldsky-schema.graphql schema.graphql

# Create the mapping directory
mkdir -p src
```

### 2.3 Create AssemblyScript Mappings

Create `src/pool.ts`:

```typescript
import { BigInt, Address } from "@graphql/types/common";
import {
  Pool,
  Participant,
  Winner,
  Sponsor,
  PoolCreatedEvent,
  DepositEvent,
  WinnerSetEvent
} from "../generated/schema";
import {
  PoolCreated,
  Deposit,
  WinnerSet,
  PoolStatusChanged,
  SponsorshipAdded
} from "../generated/Pool/Pool";

export function handlePoolCreated(event: PoolCreated): void {
  let pool = new Pool(event.params.poolId.toString());

  pool.host = event.params.host;
  pool.name = event.params.poolName;
  pool.depositAmountPerPerson = event.params.depositAmountPerPerson;
  pool.penaltyFeeRate = event.params.penaltyFeeRate;
  pool.token = event.params.token;
  pool.status = "INACTIVE";

  // Initialize balance fields
  pool.totalDeposits = BigInt.fromI32(0);
  pool.feesAccumulated = BigInt.fromI32(0);
  pool.feesCollected = BigInt.fromI32(0);
  pool.balance = BigInt.fromI32(0);
  pool.sponsored = BigInt.fromI32(0);

  // Event metadata
  pool.blockNumber = event.block.number;
  pool.blockTimestamp = event.block.timestamp;
  pool.transactionHash = event.transaction.hash;
  pool.createdAt = event.block.timestamp;
  pool.updatedAt = event.block.timestamp;

  pool.save();

  // Create event entity
  let poolCreatedEvent = new PoolCreatedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  poolCreatedEvent.poolId = event.params.poolId;
  poolCreatedEvent.host = event.params.host;
  poolCreatedEvent.poolName = event.params.poolName;
  poolCreatedEvent.depositAmountPerPerson = event.params.depositAmountPerPerson;
  poolCreatedEvent.penaltyFeeRate = event.params.penaltyFeeRate;
  poolCreatedEvent.token = event.params.token;
  poolCreatedEvent.blockNumber = event.block.number;
  poolCreatedEvent.blockTimestamp = event.block.timestamp;
  poolCreatedEvent.transactionHash = event.transaction.hash;
  poolCreatedEvent.logIndex = event.logIndex;
  poolCreatedEvent.save();
}

export function handleDeposit(event: Deposit): void {
  let participantId = event.params.poolId.toString() + "-" + event.params.participant.toHexString();
  let participant = new Participant(participantId);

  participant.pool = event.params.poolId.toString();
  participant.participant = event.params.participant;
  participant.deposit = event.params.amount;
  participant.feesCharged = BigInt.fromI32(0);
  participant.refunded = false;
  participant.active = true;
  participant.joinedAt = event.block.timestamp;
  participant.blockNumber = event.block.number;
  participant.blockTimestamp = event.block.timestamp;
  participant.transactionHash = event.transaction.hash;

  participant.save();

  // Update pool balance
  let pool = Pool.load(event.params.poolId.toString());
  if (pool) {
    pool.totalDeposits = pool.totalDeposits.plus(event.params.amount);
    pool.balance = pool.balance.plus(event.params.amount);
    pool.updatedAt = event.block.timestamp;
    pool.save();
  }
}

// Add more handlers as needed...
```

### 2.4 Deploy the Subgraph

```bash
# Build the subgraph
goldsky subgraph build

# Deploy to Goldsky
goldsky subgraph deploy pool-subgraph/1.0.0 \
  --path . \
  --network base-sepolia
```

## 🪞 Step 3: Configure Goldsky Mirror

### 3.1 Set Up Mirror Configuration

```bash
# Copy the mirror configuration
cp ../goldsky-mirror-config.yaml mirror-config.yaml

# Update the configuration with your values
# Replace ${GOLDSKY_SUBGRAPH_ID} with your deployed subgraph ID
# Replace ${NEON_DATABASE_URL} with your Neon connection string
# Replace ${WEBHOOK_URL} with your webhook endpoint
```

### 3.2 Deploy Mirror

```bash
# Deploy the mirror
goldsky mirror create pool-mirror \
  --config mirror-config.yaml

# Check mirror status
goldsky mirror status pool-mirror
```

## 🕳️ Step 4: Set Up Webhook Endpoint

### 4.1 Environment Variables

```bash
# Copy environment template
cp .env.example .env.local

# Update with your actual values:
# - NEON_DATABASE_URL
# - GOLDSKY_API_KEY
# - GOLDSKY_SUBGRAPH_ID
# - GOLDSKY_WEBHOOK_SECRET
# - WEBHOOK_URL
```

### 4.2 Local Development Setup

```bash
# Install ngrok for local webhook testing
npm install -g ngrok

# In one terminal, start the Next.js app
pnpm dev

# In another terminal, expose the webhook endpoint
ngrok http 3000

# Copy the ngrok URL and update WEBHOOK_URL in .env.local
# Example: WEBHOOK_URL=https://abc123.ngrok.io
```

### 4.3 Test Webhook Endpoint

```bash
# Test the health check endpoint
curl https://your-ngrok-url.ngrok.io/api/webhooks/goldsky

# Should return:
# {"status":"healthy","timestamp":"...","service":"goldsky-webhook"}
```

## 🧪 Step 5: Validation & Testing

### 5.1 Create Test Pool

```bash
# Use the existing contract deployment script
cd contracts
forge script script/Pool.s.sol:PoolScript --rpc-url base-sepolia --broadcast --sig "run_withSetup()"
```

### 5.2 Monitor the Data Flow

1. **Check Goldsky Dashboard**: Verify subgraph is indexing
2. **Check Neon Database**: Verify data is being written
3. **Check Webhook Logs**: Verify events are being received

```sql
-- Check if pool was created in Neon
SELECT * FROM pools ORDER BY created_at DESC LIMIT 5;

-- Check participants
SELECT * FROM pool_participants ORDER BY joined_at DESC LIMIT 5;

-- Check sync status
SELECT
  contract_id,
  name,
  status,
  block_number,
  synced_at
FROM pools
WHERE synced_at > NOW() - INTERVAL '1 hour';
```

### 5.3 Test Contract Interaction

```bash
# Join the test pool (from the contract deployment)
# This should trigger:
# 1. Contract event emission
# 2. Subgraph indexing
# 3. Mirror syncing to Neon
# 4. Webhook notification
# 5. Console logs in your Next.js app
```

## 🔧 Troubleshooting

### Common Issues

**1. Subgraph not indexing**

```bash
# Check subgraph logs
goldsky subgraph logs pool-subgraph/1.0.0

# Verify contract address and start block
goldsky subgraph info pool-subgraph/1.0.0
```

**2. Mirror not syncing**

```bash
# Check mirror status
goldsky mirror status pool-mirror

# Check mirror logs
goldsky mirror logs pool-mirror
```

**3. Webhook not receiving events**

```bash
# Verify webhook URL is accessible
curl -X POST https://your-webhook-url/api/webhooks/goldsky \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check Mirror webhook configuration
goldsky mirror describe pool-mirror
```

**4. Database connection issues**

```bash
# Test Neon connection
psql "your-neon-connection-string" -c "SELECT NOW();"

# Check pool connections
psql "your-neon-connection-string" -c "SELECT count(*) FROM pg_stat_activity;"
```

## ✅ Phase 1 Success Criteria

-   [ ] Neon database created with proper schema
-   [ ] Goldsky subgraph deployed and indexing events
-   [ ] Mirror configured and syncing data to Neon
-   [ ] Webhook endpoint receiving and processing events
-   [ ] Test pool creation flows through entire pipeline
-   [ ] Data consistency between contract events and database
-   [ ] Monitoring and logging in place

## 🚀 Next Steps

Once Phase 1 is complete and validated:

1. **Phase 2**: Enhanced server actions with optimistic updates
2. **Phase 3**: Frontend migration with real-time hooks
3. **Phase 4**: IPFS metadata integration
4. **Phase 5**: Full migration and Supabase removal

## 📞 Support

If you encounter issues:

1. Check the [Goldsky Documentation](https://docs.goldsky.com)
2. Review the [Neon Documentation](https://neon.tech/docs)
3. Create an issue in the repository with detailed logs
