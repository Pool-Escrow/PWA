import React, { useEffect, useCallback } from 'react';
import { BottomBarButton } from './bottom-bar-button';
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions';
import { useUserPoolActions } from '@/app/_client/hooks/use-user-pool-actions';

interface UserBottomBarProps {
    poolStatus: POOLSTATUS;
    poolId: string;
    poolPrice: number;
    poolTokenSymbol: string;
    tokenDecimals: number;
    isParticipant?: boolean;
    onViewTicket: () => void;
    openOnRampDialog: () => void;
    onSuccessfulJoin: () => void;
    updatePoolDetails: () => void;
    setBottomBarContent: (content: React.ReactNode) => void;
}

export const UserBottomBar: React.FC<UserBottomBarProps> = ({
    poolStatus,
    poolId,
    poolPrice,
    poolTokenSymbol,
    tokenDecimals,
    isParticipant,
    onViewTicket,
    openOnRampDialog,
    onSuccessfulJoin,
    updatePoolDetails,
    setBottomBarContent
}) => {
    const { handleJoinPool } = useUserPoolActions(poolId, poolPrice, tokenDecimals, openOnRampDialog, onSuccessfulJoin);
    console.log('UserBottomBar ==isParticipant===', isParticipant)
    useEffect(() => {
        if (poolStatus === POOLSTATUS.DEPOSIT_ENABLED || poolStatus === POOLSTATUS.STARTED) {
            updatePoolDetails();
        }
    }, [poolStatus, updatePoolDetails]);

    const renderUserButton = useCallback(() => {
        let buttonLabel = '';
        let buttonAction: () => void;

        if (poolStatus === POOLSTATUS.DEPOSIT_ENABLED) {
            buttonLabel = isParticipant ? 'View My Ticket' : `Register for ${poolPrice} ${poolTokenSymbol}`;
            buttonAction = isParticipant ? onViewTicket : handleJoinPool;
        } else if (poolStatus === POOLSTATUS.STARTED && isParticipant) {
            buttonLabel = 'View My Ticket';
            buttonAction = onViewTicket;
        } else {
            return null;
        }

        const button = <BottomBarButton label={buttonLabel} onClick={buttonAction} />;
        // setBottomBarContent(button);
        return button;
    }, [poolStatus, isParticipant, handleJoinPool, onViewTicket, poolPrice, poolTokenSymbol, setBottomBarContent]);

    return <>{renderUserButton()}</>;
};