# System Architecture Overview

This document provides a comprehensive overview of the Pool PWA system architecture, including recent improvements to data fetching, RPC configuration, and user pools management.

## 📋 Table of Contents

-   [Architecture Overview](#architecture-overview)
-   [Data Flow Architecture](#data-flow-architecture)
-   [User Pools System](#user-pools-system)
-   [RPC Configuration](#rpc-configuration)
-   [Error Handling Strategy](#error-handling-strategy)
-   [Performance Optimizations](#performance-optimizations)

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Components]
        Hooks[Custom Hooks]
        RQ[React Query Cache]
    end

    subgraph "Server Layer"
        SA[Server Actions]
        UC[Use Cases]
        BC[Blockchain Layer]
        DB[Database Layer]
    end

    subgraph "External Services"
        RPC[RPC Endpoints]
        SC[Smart Contracts]
        SB[Supabase Database]
    end

    UI --> Hooks
    Hooks --> RQ
    RQ --> SA
    SA --> UC
    UC --> BC
    UC --> DB
    BC --> RPC
    BC --> SC
    DB --> SB

    classDef client fill:#e1f5fe
    classDef server fill:#f3e5f5
    classDef external fill:#fff3e0

    class UI,Hooks,RQ client
    class SA,UC,BC,DB server
    class RPC,SC,SB external
```

## 🔄 Data Flow Architecture

### Upcoming Pools Flow

```mermaid
sequenceDiagram
    participant UI as UpcomingPoolsV2
    participant Hook as useUpcomingPoolsV2
    participant RQ as React Query
    participant SA as getUpcomingPoolsAction
    participant BC as Blockchain Layer
    participant DB as Database Layer
    participant RPC as Base Sepolia RPC
    participant SC as Smart Contract
    participant SB as Supabase

    UI->>Hook: Component Mount
    Hook->>RQ: Query Key: ['upcoming-pools-v2']
    RQ->>SA: Server Action Call

    par Parallel Data Fetch
        SA->>BC: getContractPools(chainId)
        BC->>RPC: multicall with chainId
        RPC->>SC: Contract Calls
        SC-->>RPC: Pool Data
        RPC-->>BC: Formatted Results
        BC-->>SA: Contract Pools[]
    and
        SA->>DB: Supabase Query
        DB->>SB: SELECT * FROM pools
        SB-->>DB: Database Pools[]
        DB-->>SA: DB Pools[]
    end

    SA->>SA: Transform & Filter Data
    SA->>SA: Apply Status Visibility Rules
    SA-->>RQ: {pools: PoolItem[], metadata}
    RQ-->>Hook: Cached Result
    Hook-->>UI: {pools, metadata, states}

    Note over UI,SB: 30s stale time, 5min cache
```

### User Pools Flow

```mermaid
sequenceDiagram
    participant UI as NextUserPoolV2
    participant Hook as useUserNextPoolsV2
    participant RQ as React Query
    participant SA as getUserNextPoolsAction
    participant Auth as Privy Auth
    participant UC as getUserUpcomingPoolsUseCase
    participant BC as getUserPools
    participant RPC as Base Sepolia RPC
    participant SC as Smart Contract

    UI->>Hook: Component Mount
    Hook->>Auth: Check Authentication
    Auth-->>Hook: User Address
    Hook->>RQ: Query Key: ['user-next-pools-v2', address]
    RQ->>SA: Server Action Call

    SA->>Auth: verifyToken()
    Auth-->>SA: Authenticated User
    SA->>UC: getUserUpcomingPoolsUseCase(address)
    UC->>BC: getUserPools(address, chainId)

    BC->>RPC: multicall with chainId
    Note over BC,RPC: Fixed: Now specifies correct chainId
    RPC->>SC: getPoolsCreatedBy & getPoolsJoinedBy
    SC-->>RPC: User Pool IDs
    RPC->>SC: getAllPoolInfo for each pool
    SC-->>RPC: Pool Details
    RPC-->>BC: Contract Pools[]
    BC-->>UC: User Pools[]
    UC->>UC: Filter & Transform
    UC-->>SA: PoolItem[]

    SA-->>RQ: {pools, metadata}
    RQ-->>Hook: Cached Result
    Hook-->>UI: {pools, states, actions}
```

## 👤 User Pools System

### Component Architecture

```mermaid
graph TB
    subgraph "User Pools Components"
        NPV2[NextUserPoolV2]
        MP[MyPools]
        UPL[UserPoolList]
    end

    subgraph "Hooks Layer"
        UNPV2[useUserNextPoolsV2]
        SAH[useServerActionQuery]
    end

    subgraph "Server Actions"
        GUNPA[getUserNextPoolsAction]
        GUPA[getUserUpcomingPoolsAction]
        GPPA[getUserPastPoolsAction]
    end

    subgraph "Use Cases"
        GUUC[getUserUpcomingPoolsUseCase]
        GPUC[getUserPastPoolsUseCase]
    end

    subgraph "Data Layer"
        GUP[getUserPools]
        GDB[getDbPools]
    end

    NPV2 --> UNPV2
    MP --> SAH
    UPL --> SAH

    UNPV2 --> GUNPA
    SAH --> GUPA
    SAH --> GPPA

    GUNPA --> GUUC
    GUPA --> GUUC
    GPPA --> GPUC

    GUUC --> GUP
    GUUC --> GDB
    GPUC --> GUP
    GPUC --> GDB

    classDef component fill:#e8f5e8
    classDef hook fill:#fff2cc
    classDef action fill:#f8cecc
    classDef usecase fill:#e1d5e7
    classDef data fill:#dae8fc

    class NPV2,MP,UPL component
    class UNPV2,SAH hook
    class GUNPA,GUPA,GPPA action
    class GUUC,GPUC usecase
    class GUP,GDB data
```

## 🌐 RPC Configuration

### Network Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        App[Pool PWA]
    end

    subgraph "RPC Configuration"
        SC[Server Config]
        WC[Wagmi Config]
        PC[Privy Config]
    end

    subgraph "Network Selection"
        ENV{NEXT_PUBLIC_NETWORK}
        TEST[testnet]
        MAIN[mainnet]
    end

    subgraph "Base Sepolia (Testnet)"
        BS_RPC1[base-sepolia.gateway.tenderly.co]
        BS_RPC2[base-sepolia.publicnode.com]
        BS_RPC3[sepolia.base.org - backup]
        BS_CONTRACT[Pool Contract: 0x5C22...]
    end

    subgraph "Base Mainnet"
        BM_RPC1[base-mainnet.infura.io]
        BM_RPC2[mainnet.base.org]
        BM_CONTRACT[Pool Contract: TBD]
    end

    App --> SC
    App --> WC
    App --> PC

    SC --> ENV
    WC --> ENV
    PC --> ENV

    ENV -->|testnet| TEST
    ENV -->|mainnet| MAIN

    TEST --> BS_RPC1
    TEST --> BS_RPC2
    TEST --> BS_RPC3
    TEST --> BS_CONTRACT

    MAIN --> BM_RPC1
    MAIN --> BM_RPC2
    MAIN --> BM_CONTRACT

    classDef app fill:#e1f5fe
    classDef config fill:#f3e5f5
    classDef network fill:#fff3e0
    classDef sepolia fill:#e8f5e8
    classDef mainnet fill:#ffebee

    class App app
    class SC,WC,PC config
    class ENV,TEST,MAIN network
    class BS_RPC1,BS_RPC2,BS_RPC3,BS_CONTRACT sepolia
    class BM_RPC1,BM_RPC2,BM_CONTRACT mainnet
```

### Multicall Fix Implementation

```mermaid
graph LR
    subgraph "Before Fix ❌"
        MC1[multicall(serverConfig, {...})]
        RPC1[Uses default/mainnet RPC]
        ERROR1[❌ Wrong chain data]
    end

    subgraph "After Fix ✅"
        PC[getPublicClient(chainId)]
        CID[actualChainId = client.chain?.id]
        MC2[multicall(serverConfig, {chainId, ...})]
        RPC2[Uses correct Base Sepolia RPC]
        SUCCESS[✅ Correct chain data]
    end

    MC1 --> RPC1 --> ERROR1
    PC --> CID --> MC2 --> RPC2 --> SUCCESS

    classDef error fill:#ffebee
    classDef success fill:#e8f5e8
    classDef process fill:#fff3e0

    class MC1,RPC1,ERROR1 error
    class PC,CID,MC2,RPC2,SUCCESS success
```

## 🛡️ Error Handling Strategy

### Error Boundary Architecture

```mermaid
graph TB
    subgraph "UI Layer Error Handling"
        UI[Component]
        EB[Error Boundary]
        FB[Fallback UI]
        RT[Retry Action]
    end

    subgraph "Hook Layer Error Handling"
        RQ[React Query]
        RL[Retry Logic]
        EXP[Exponential Backoff]
        CACHE[Error Cache]
    end

    subgraph "Server Layer Error Handling"
        SA[Server Action]
        TRY[Try/Catch]
        LOG[Error Logging]
        GM[Graceful Metadata]
    end

    subgraph "Network Layer Error Handling"
        RPC[RPC Calls]
        FO[Fallback RPC]
        TO[Timeout Handling]
        SUPP[Error Suppression]
    end

    UI --> EB
    EB -->|Error| FB
    FB --> RT
    RT --> UI

    UI --> RQ
    RQ --> RL
    RL --> EXP
    EXP --> CACHE

    RQ --> SA
    SA --> TRY
    TRY --> LOG
    TRY --> GM

    SA --> RPC
    RPC --> FO
    RPC --> TO
    RPC --> SUPP

    classDef ui fill:#e1f5fe
    classDef hook fill:#f3e5f5
    classDef server fill:#fff3e0
    classDef network fill:#e8f5e8

    class UI,EB,FB,RT ui
    class RQ,RL,EXP,CACHE hook
    class SA,TRY,LOG,GM server
    class RPC,FO,TO,SUPP network
```

## ⚡ Performance Optimizations

### Caching Strategy

```mermaid
graph TB
    subgraph "React Query Cache Layers"
        QK[Query Keys]
        ST[Stale Time: 30s]
        GC[Garbage Collection: 5min]
        BG[Background Refetch]
    end

    subgraph "Data Fetching Strategy"
        PAR[Parallel Fetching]
        BATCH[Multicall Batching]
        FALL[Graceful Fallbacks]
        RETRY[Smart Retry Logic]
    end

    subgraph "UI Optimization"
        LAZY[Lazy Loading]
        SKEL[Skeleton States]
        MEMO[React.memo]
        COMP[Component Splitting]
    end

    subgraph "Network Optimization"
        POOL[Connection Pooling]
        CACHE_RPC[RPC Response Cache]
        DEBOUNCE[Request Debouncing]
        TIMEOUT[Request Timeouts]
    end

    QK --> ST
    ST --> GC
    GC --> BG

    PAR --> BATCH
    BATCH --> FALL
    FALL --> RETRY

    LAZY --> SKEL
    SKEL --> MEMO
    MEMO --> COMP

    POOL --> CACHE_RPC
    CACHE_RPC --> DEBOUNCE
    DEBOUNCE --> TIMEOUT

    classDef cache fill:#e8f5e8
    classDef fetch fill:#fff2cc
    classDef ui fill:#e1f5fe
    classDef network fill:#f3e5f5

    class QK,ST,GC,BG cache
    class PAR,BATCH,FALL,RETRY fetch
    class LAZY,SKEL,MEMO,COMP ui
    class POOL,CACHE_RPC,DEBOUNCE,TIMEOUT network
```

## 🔧 Development Tools

### Logging Strategy

```mermaid
graph LR
    subgraph "Development Mode"
        DEV{NODE_ENV === 'development'}
        VERBOSE{NEXT_PUBLIC_VERBOSE_LOGS}
        LOGS[Detailed Logging]
        QUIET[Clean Console]
    end

    subgraph "Production Mode"
        PROD[NODE_ENV === 'production']
        ERROR_ONLY[Error Logging Only]
        MONITOR[Error Monitoring]
    end

    DEV -->|true| VERBOSE
    VERBOSE -->|true| LOGS
    VERBOSE -->|false| QUIET

    DEV -->|false| PROD
    PROD --> ERROR_ONLY
    ERROR_ONLY --> MONITOR

    classDef dev fill:#e8f5e8
    classDef prod fill:#fff2cc
    classDef condition fill:#f3e5f5

    class LOGS,QUIET dev
    class PROD,ERROR_ONLY,MONITOR prod
    class DEV,VERBOSE condition
```

## 📊 Key Metrics

-   **Upcoming Pools**: 172 contract pools → 21 visible pools (12% sync rate)
-   **Cache Performance**: 30s stale time, 5min garbage collection
-   **Error Recovery**: 3 retry attempts with exponential backoff
-   **RPC Reliability**: Multiple fallback endpoints with automatic failover
-   **Build Performance**: ~45s with optimized bundling
-   **Console Noise**: Reduced by 90% in development mode

## 🚀 Recent Improvements

1. **RPC Configuration Fixed**: Both general and user pools now correctly target Base Sepolia
2. **User Pools Rewritten**: Complete V2 implementation with robust error handling
3. **Console Cleanup**: Development logging now conditional on verbose flag
4. **Performance Enhanced**: Parallel data fetching and smart caching strategies
5. **Error Boundaries**: Comprehensive error handling with user-friendly retry mechanisms

---

_Last updated: December 19, 2024_
_Architecture reflects Pool PWA v2.0 improvements_
