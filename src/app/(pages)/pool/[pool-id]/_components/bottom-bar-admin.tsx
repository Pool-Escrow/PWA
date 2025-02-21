import React, { useEffect, useMemo } from 'react';
import { BottomBarButton } from './bottom-bar-button';
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions';
import { useAdminPoolActions } from '@/app/_client/hooks/use-admin-pool-actions';

interface AdminBottomBarProps {
    poolStatus: POOLSTATUS;
    poolId: string;
    updatePoolDetails: () => void;
    statusUpdatedByAdmin: boolean;
    onStatusUpdatedByAdmin: (isUpdated: boolean) => void;
    setBottomBarContent: (content: React.ReactNode) => void;
}

export const AdminBottomBar: React.FC<AdminBottomBarProps> = ({
    poolStatus,
    poolId,
    updatePoolDetails,
    statusUpdatedByAdmin,
    onStatusUpdatedByAdmin,
    setBottomBarContent
}) => {
    const { handleEnableDeposits, handleStartPool, handleEndPool } = useAdminPoolActions(poolId, onStatusUpdatedByAdmin);

    useEffect(() => {
        if (poolStatus === POOLSTATUS.DEPOSIT_ENABLED) {
            updatePoolDetails();
        }
    }, [poolStatus, updatePoolDetails]);

    const renderAdminButton = useMemo(() => {
        console.log('- renderAdminButton - ')
        console.log('statusUpdatedByAdmin', statusUpdatedByAdmin)
        console.log('poolStatus', poolStatus)
        let buttonLabel = '';
        let buttonAction: () => void;
    
        switch (poolStatus) {
            case POOLSTATUS.INACTIVE:
                buttonLabel = 'Enable Deposit';
                buttonAction = handleEnableDeposits;
                break;
            case POOLSTATUS.DEPOSIT_ENABLED:
                buttonLabel = 'Start Pool';
                buttonAction = handleStartPool;
                break;
            case POOLSTATUS.STARTED:
                buttonLabel = 'End Pool';
                buttonAction = handleEndPool;
                break;
            default:
                return null;
        }
    
        const button = <BottomBarButton label={buttonLabel} onClick={buttonAction} />;
        setBottomBarContent(button);
        return button;
    }, [poolStatus, statusUpdatedByAdmin]);

    return <div>{renderAdminButton}</div>;
};