import useTransactions from '@/app/_client/hooks/use-transactions';
import { currentPoolAddress } from '@/app/_server/blockchain/server-config';
import { poolAbi } from '@/types/contracts';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface AdminActions {
    handleEnableDeposits: () => void;
    handleStartPool: () => void;
    handleEndPool: () => void;
}

export function useAdminPoolActions(poolId: string, onStatusUpdatedByAdmin: (isUpdated: boolean) => void): AdminActions {
    const { executeTransactions } = useTransactions();
    const router = useRouter();

    const handleEnableDeposits = () => {
        toast('Enabling deposits...');
        executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'enableDeposit',
                args: [BigInt(poolId)],
            }
        ], {
            type: 'ENABLE_DEPOSITS',
            onSuccess: () => {
                toast.success('Deposits enabled successfully!');
                onStatusUpdatedByAdmin(true);
                router.refresh();
            }
        }).catch(error => {
            console.error('Error enabling deposits:', error);
        });
    };

    const handleStartPool = () => {
        toast('Starting pool...');
        executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'startPool',
                args: [poolId],
            }
        ], {
            type: 'START_POOL',
            onSuccess: () => {
                toast.success('Pool started successfully!');
                onStatusUpdatedByAdmin(true);
                router.refresh();
            }
        }).catch(error => {
            console.error('Error starting pool:', error);
        });
    };

    const handleEndPool = () => {
        toast('Ending pool...');
        executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'endPool',
                args: [BigInt(poolId)],
            }
        ], {
            type: 'END_POOL',
            onSuccess: () => {
                toast.success('Pool ended successfully!');
                onStatusUpdatedByAdmin(true);
                router.refresh();
            }
        }).catch(error => {
            console.error('Error ending pool:', error);
        });
    };

    return { handleEnableDeposits, handleStartPool, handleEndPool };
}
