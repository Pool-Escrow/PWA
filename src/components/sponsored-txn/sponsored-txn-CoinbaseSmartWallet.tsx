import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useMemo } from "react";
import { Button } from "../ui/button";
 
export default function SponsoredTxn() {
  const account = useAccount();
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => alert(`Transaction completed: ${id}`) },
  });
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);
 
  return (
    <div>
      <div>
        <Button
          onClick={() => {
            writeContracts({
              contracts: [
                {
                  address: "0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b",
                  abi: [{"type":"function","name":"mint","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"}],
                  functionName: "mint",
                  args: [account.address, "1000000000000000000000"],
                },
              ],
              capabilities,
            });
          }}
        >
          Mint
        </Button>
      </div>
    </div>
  );
}