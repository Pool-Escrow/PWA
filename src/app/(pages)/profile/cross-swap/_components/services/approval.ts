import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import type { APIResponse, ApprovalStatusRequest, ApprovalStatusResponse } from '../../types'
import { CONFIG } from '../config'
import { APIError } from '../utils/errors'

interface UseApprovalStatusProps {
    tokenContractAddress: string
    userAddress: string
    totalAmount: string
    chainId: number
    decimals: number
}

export const useApprovalStatus = ({
    tokenContractAddress,
    userAddress,
    totalAmount,
    chainId,
    decimals,
}: UseApprovalStatusProps) => {
    const [allowance, setAllowance] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)
    const [allowanceAmount, setAllowanceAmount] = useState('0')
    useEffect(() => {
        if (Number(totalAmount) > 0) {
            setIsEnabled(true)
        } else {
            setIsEnabled(false)
        }
    }, [totalAmount])

    const { data: apiApprovalStatus, error: apiError } = useQuery({
        queryKey: ['approvalStatus', tokenContractAddress, userAddress, totalAmount, chainId, decimals],
        queryFn: async (): Promise<boolean> => {
            const { path } = CONFIG.API.ENDPOINTS['approval/status']
            const params: ApprovalStatusRequest = {
                userWalletAddress: userAddress,
                tokenContractAddress,
                chainId: chainId,
                defiPlatformIds: CONFIG.CHAIN.BASE.platformId,
            }
            const response = await fetch(
                `${CONFIG.API.BASE_URL}${path}?${new URLSearchParams(params as unknown as URLSearchParams)}`,
                { headers: CONFIG.API.HEADERS as HeadersInit },
            )
            if (!response.ok) {
                throw new APIError('UNKNOWN', 'Failed to fetch approval status')
            }

            const data = ((await response.json()) as APIResponse<ApprovalStatusResponse[]>).data[11]
            const approvedAmount = data.amount
            if (!approvedAmount) {
                setAllowance(false)
                return false
            }
            setAllowanceAmount(approvedAmount)
            const isAllowance = BigInt(approvedAmount) >= parseUnits(totalAmount, decimals)
            setAllowance(isAllowance)
            return isAllowance
        },
        enabled: isEnabled, //!allowance, // Execute only if enabled and no allowance
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
    })

    const isApproved = allowance
        ? Number(allowanceAmount) >= parseUnits(totalAmount, decimals)
        : (apiApprovalStatus ?? false)
    const approvedAmount = allowance ? formatUnits(BigInt(allowanceAmount), decimals) : '0'

    return {
        isApproved,
        approvedAmount,
        error: apiError,
        isLoading: !allowance && !apiApprovalStatus,
        allowance,
        apiApprovalStatus,
    }
}

// Tipo de ayuda para los consumidores del hook
export type ApprovalStatusReturn = ReturnType<typeof useApprovalStatus>
