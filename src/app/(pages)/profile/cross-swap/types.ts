import type { ERROR_CODES } from "./_components/utils/errors"

// Base API Types
export type HTTPMethod = "GET" | "POST"

export type APIEndpoint = {
    path: string
    call: HTTPMethod
}

// Error Types
export type APIErrorCode = keyof typeof ERROR_CODES

export type APIResponse<T> = {
    code: string
    data: T
    msg?: string
}

export interface APIError {
    code: APIErrorCode
    msg: string
    data?: unknown
}

export interface MMError {
    code: number
    msg: string
    stack?: unknown
}
// Chain and Network Types
export interface NativeCurrency {
    name: string
    symbol: string
    decimals: number
}

export interface Explorer {
    name: string
    url: string
    standard: string
}

export interface Chain {
    name: string
    chain: string
    rpc: string[]
    faucets: string[]
    nativeCurrency: NativeCurrency
    infoURL: string
    shortName: string
    chainId: number
    networkId: number
    slip44?: number
    status?: string
    explorers?: Explorer[]
}

export interface Network {
    chainId: string
    chainName: string
    platformId?: number
    nativeCurrency?: NativeCurrency
    rpcUrls?: string[]
    blockExplorerUrls?: string[]
}

export interface OKXNetwork {
    chainId: string
    chainName: string
    dexTokenApproveAddress: string
}

export interface ChainsData {
    chains: Chain[]
}

// Token Types
export interface Token {
    chainId?: string
    chainName?: string
    decimals: string
    tokenContractAddress: string
    tokenLogoUrl: string
    tokenName: string
    tokenSymbol: string
    dexTokenApproveAddress?: string
}

export interface OKXToken {
    decimals: string
    tokenContractAddress: string
    tokenLogoUrl?: string
    tokenName?: string
    tokenSymbol: string
}

// Bridge Types
export interface BridgeInfo {
    protocol: string
    rate: {
        from: {
            amount: string
            token: string
        }
        to: {
            amount: string
            token: string
        }
    }
    fee: {
        networkFee: string
        token: string
    }
    estimatedTime: string
    slippage: string
}

export interface OKXBridgeRouter {
    bridgeId: number
    bridgeName: string
    crossChainFee: string
    crossChainFeeTokenAddress: string
    crossChainFeeUsd: string
    otherNativeFee: string
    otherNativeFeeUsd: string
}
export interface OKXRouterList {
    estimateGasFee: string
    estimateGasFeeUsd: string
    estimateTime: string
    fromChainNetworkFee: string
    fromDexRouterList: []
    minimumReceived: string
    router: OKXBridgeRouter
    toChainNetworkFee: string
    toDexRouterList: []
    toTokenAmount: string
}

export interface OKXRoute {
    fromChainId: string
    fromToken: OKXToken
    fromTokenAmount: string
    routerList: OKXRouterList[]
    toChainId: string
    toToken: OKXToken
}

export interface OKXSwapTransaction {
    data: string
    from: string
    gasLimit: string
    gasPrice: string
    maxPriorityFeePerGas: string
    randomKeyAccount: []
    signatureData: []
    to: string
    value: string
}

export interface OKXSwapData {
    fromTokenAmount: string
    minimumReceived: string
    orderId: string
    router: OKXBridgeRouter
    toTokenAmount: string
    tx: OKXSwapTransaction
}
// Request/Response Types

export interface OKXHistoryResponse {
    cursor: string
    transactionList: OKXHistoryTransaction[]
}

export interface OKXHistoryTransaction {
    amount: string
    chainIndex: string
    from: [object]
    hitBlacklist: boolean
    itype: string
    methodId: string
    nonce: string
    symbol: string
    tag: string
    to: [object]
    tokenAddress: string
    txFee: string
    txHash: string
    txStatus: string
    txTime: string
}
export interface OKXApprovalData {
    data: string
    dexContractAddress: string
    gasLimit: string
    gasPrice: string
}
export interface ApprovalStatusRequest {
    userWalletAddress: string
    tokenContractAddress: string
    chainId: number
    defiPlatformIds: number
}

export interface ApprovalStatusResponse {
    // [platformId: number]: {
    amount: string
    needCancelApproveToken: boolean
    status: number
    tokenContractAddress: string
    txId: string
    type: string
    // }
}

export interface Transaction {
    id: string
    date: string
    fromChain: {
        name: string
        chainId: string
    }
    toChain: {
        name: string
        chainId: string
    }
    amount: string
    toAmount: string
    fromToken: {
        name: string
        logo: string
    }
    toToken: {
        name: string
        logo: string
    }
    toTxnHash: string
    status: string
}

export interface TransactionStatusRequest {
    hash: string
}

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "INVALID"

export interface TransactionStatusResponse {
    status: TransactionStatus
    hash: string
    timestamp: string
}

export interface OKXAccountRequest {
    addresses: Array<{
        chainIndex: string
        address: string
    }>
}

export interface OKXAccountResponse {
    address: string
    chainIndex: string
    status: string
    createdAt?: string
    updatedAt?: string
}

// State Management Types
export interface SwapState {
    fromNetwork: OKXNetwork
    fromToken: OKXToken | null
    fromAmount: string
    receivedAmount: string
    isApproved: boolean
    routerInfo: BridgeInfo | null
    isLoading?: boolean
    transactions: Transaction[]
}

export interface OKXSwapStatus {
    bridgeHash: string
    crossChainFee: [object]
    crossChainInfo: [object]
    destinationChainGasfee: string
    detailStatus:
        | "WAITING"
        | "BRIDGE_PENDING"
        | "FROM_SUCCESS"
        | "FROM_FAILURE"
        | "BRIDGE_SUCCESS"
        | "REFUND"
        | "SUCCESS"
    errorMsg: string
    fromAmount: string
    fromChainId: string
    fromTokenAddress: string
    fromTxHash: string
    refundChainId: string
    refundTokenAddress: string
    refundTxHash: string
    sourceChainGasfee: string
    status: "SUCCESS" | "PENDING" | "FAILURE"
    toAmount: string
    toChainId: string
    toTokenAddress: string
    toTxHash: string
}
export type SwapAction =
    | { type: "SET_FROM_NETWORK"; payload: OKXNetwork }
    | { type: "SET_FROM_TOKEN"; payload: OKXToken | null }
    | { type: "SET_FROM_AMOUNT"; payload: string }
    | { type: "SET_RECEIVED_AMOUNT"; payload: string }
    | { type: "SET_APPROVAL_STATUS"; payload: boolean }
    | { type: "SET_ROUTER_INFO"; payload: BridgeInfo | null }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_HISTORY"; payload: Transaction[] }

// Route Calculation Types
export interface RouteCalculationProps {
    fromNetwork: OKXNetwork
    fromToken: OKXToken | null
    fromAmount: string
    walletAddress: string
    dispatch: React.Dispatch<SwapAction>
}

export interface RouterListItem {
    toTokenAmount: string
    fromChainNetworkFee: string
    estimateTime: string
    router: {
        bridgeName: string
    }
}

export interface RouteResponseData {
    routerList: RouterListItem[]
}

// Fix: Use APIResponse generic type correctly
export type RouteResponse = APIResponse<RouteResponseData>

// API Response Types
export type ApproveResponse = APIResponse<
    {
        tx: {
            to: string
            data: string
            value: string
            gasLimit: string
            gasPrice: string
        }
        data?: string
        gasLimit?: string
        gasPrice?: string
    }[]
>

export type SwapResponse = APIResponse<
    {
        tx: {
            to: string
            data: string
            value: string
            gasLimit: string
            gasPrice: string
            chainId?: string
        }
    }[]
>

export type ChainsResponse = APIResponse<OKXNetwork[]>

export type TokensResponse = APIResponse<OKXToken[]>

export interface TokenSelectionProps {
    fromNetwork: OKXNetwork
}
