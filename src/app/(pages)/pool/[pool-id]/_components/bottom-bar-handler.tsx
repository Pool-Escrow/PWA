import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/app/_client/providers/app-store.provider';
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions';
import { useRouter } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { getAbiItem } from 'viem';
import { currentPoolAddress } from '@/app/_server/blockchain/server-config';
import { poolAbi } from '@/types/contracts';
import { useUserInfo } from '@/hooks/use-user-info';
import { useQueryClient } from '@tanstack/react-query';
import { AdminBottomBar } from './bottom-bar-admin';
import { UserBottomBar } from './bottom-bar-user';
import HybridRegistration from './terms-acceptance-dialog';

interface BottomBarHandlerProps {
    keysToRefetch: string[];
    isAdmin: boolean;
    poolStatus: POOLSTATUS;
    poolId: string;
    poolPrice: number;
    poolTokenSymbol: string;
    tokenDecimals: number;
    requiredAcceptance: boolean;
    termsUrl: string;
}

export default function BottomBarHandler({
    keysToRefetch,
    isAdmin,
    poolStatus,
    poolId,
    poolPrice,
    poolTokenSymbol,
    tokenDecimals,
    requiredAcceptance,
    termsUrl,
}: BottomBarHandlerProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const setBottomBarContent = useAppStore((state) => state.setBottomBarContent);
    const [localIsParticipant, setLocalIsParticipant] = useState(false);
    const [statusUpdatedByAdmin, onStatusUpdatedByAdmin] = useState(false)
    const { data: user } = useUserInfo();
    console.log('user')
    const address = user?.address;

    const { data: isParticipant, isLoading: isParticipantLoading } = useReadContract({
        abi: [getAbiItem({ abi: poolAbi, name: 'isParticipant' })],
        address: currentPoolAddress,
        functionName: 'isParticipant',
        args: [address || '0x', BigInt(poolId)],
        query: { enabled: Boolean(address && poolId), refetchInterval: 5000 },
    });

    function handleViewTicket(){
        router.push(`/pool/${poolId}/ticket`);
    }

    function updatePoolDetails(){
        keysToRefetch.forEach((key) => {
            queryClient.refetchQueries({ queryKey: [key] }).catch((error) => {
                console.error('Error refetching query:', error);
            });
        });
    }


    useEffect(() => {
        if (!isParticipantLoading && isParticipant !== undefined) {
            setLocalIsParticipant(isParticipant);
            updatePoolDetails();
        }
    }, [isParticipant, isParticipantLoading]);

    console.log('<<out isParticipant', isParticipant)
    return (
        <div className="mb-3 w-full">
            {isAdmin ? (
                <AdminBottomBar
                    poolStatus={poolStatus}
                    poolId={poolId}
                    statusUpdatedByAdmin={statusUpdatedByAdmin}
                    updatePoolDetails={updatePoolDetails}
                    onStatusUpdatedByAdmin={(isUpdated) => {
                        if (isUpdated) onStatusUpdatedByAdmin(isUpdated);
                    }}
                    setBottomBarContent={setBottomBarContent}
                />
            ) : (
                <UserBottomBar
                    poolStatus={poolStatus}
                    poolId={poolId}
                    poolPrice={poolPrice}
                    poolTokenSymbol={poolTokenSymbol}
                    tokenDecimals={tokenDecimals}
                    isParticipant={isParticipant || localIsParticipant}
                    onViewTicket={handleViewTicket}
                    openOnRampDialog={() => console.log('Open on-ramp dialog')}
                    onSuccessfulJoin={() => {
                        setLocalIsParticipant(true);
                        router.refresh();
                        updatePoolDetails();
                    }}
                    updatePoolDetails={updatePoolDetails}
                    setBottomBarContent={setBottomBarContent}
                />
            )}
            {requiredAcceptance && (
                <HybridRegistration open={false} onOpenChange={() => {}} onAccept={() => {}} termsUrl={termsUrl} />
            )}
        </div>
    );
}