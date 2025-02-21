import useTransactions from '@/app/_client/hooks/use-transactions';
import { deposit } from '@/app/_lib/blockchain/functions/pool/deposit';
import { approve } from '@/app/_lib/blockchain/functions/token/approve';
import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config';
import { tokenAbi } from '@/types/contracts';
import { useWallets } from '@privy-io/react-auth';
import { parseUnits, isAddress } from 'viem';
import { useReadContract } from 'wagmi';
import { toast } from 'sonner';

type HexAddress = `0x${string}`;

export function useUserPoolActions(
    poolId: string,
    poolPrice: number,
    tokenDecimals: number,
    openOnRampDialog: () => void,
    onSuccessfulJoin: () => void
) {
    const { executeTransactions, isReady } = useTransactions();
    const { wallets } = useWallets();

    const walletAddress = wallets[0]?.address;
    const validAddress: HexAddress = isAddress(walletAddress || '')
        ? (walletAddress as HexAddress)
        : ('0x0000000000000000000000000000000000000000' as HexAddress);

    const { data: userBalance } = useReadContract({
        address: currentTokenAddress,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [validAddress],
    });

    const handleJoinPool = () => {
        if (!isReady) return;
        const bigIntPrice = parseUnits(poolPrice.toFixed(20), tokenDecimals);

        if (Number(userBalance || 0) < bigIntPrice) {
            toast('Insufficient funds, please top up your account.');
            openOnRampDialog();
            return;
        }

        const transactions = [
            ...(bigIntPrice > 0 ? [approve({ spender: currentPoolAddress, amount: bigIntPrice.toString() })] : []),
            deposit({ poolId, amount: bigIntPrice.toString() })
        ];

        executeTransactions(transactions, {
            type: 'JOIN_POOL',
            onSuccess: onSuccessfulJoin,
        }).catch(error => {
            console.error('Error joining pool:', error);
        });
    };

    return { handleJoinPool };
}