import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import type { Address } from 'viem'
import { erc20Abi } from 'viem'
import { baseSepolia } from 'viem/chains'

const poolDeployments = {
    [baseSepolia.id]: '0x5C22662210E48D0f5614cACA6f7a6a938716Ea26' as Address, // github commit: eda48eb,
}

const dropletDeployments = {
    [baseSepolia.id]: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b' as Address,
}

const dropletAbi = [
    ...erc20Abi,
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const

export default defineConfig({
    out: 'src/types/contracts.ts',
    contracts: [
        {
            name: 'Droplet',
            abi: dropletAbi,
            address: dropletDeployments,
        },
    ],
    plugins: [
        foundry({
            project: 'contracts',
            include: ['Pool.json'],
            deployments: {
                Pool: poolDeployments,
                Droplet: dropletDeployments,
            },
        }),
        react(),
    ],
})
