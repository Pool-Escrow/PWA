import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import { baseSepolia } from 'viem/chains'

export default defineConfig({
    out: 'src/types/contracts.ts',
    plugins: [
        foundry({
            project: 'contracts',
            include: ['Droplet.json', 'Pool.json'],
            deployments: {
                Pool: {
                    [baseSepolia.id]: '0x5C22662210E48D0f5614cACA6f7a6a938716Ea26', // github commit: eda48eb
                },
                Droplet: {
                    [baseSepolia.id]: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
                },
            },
        }),
    ],
})
