import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import { baseSepolia } from 'viem/chains'

export default defineConfig({
	out: 'src/types/contracts.ts',
	plugins: [
		foundry({
			project: 'contracts',
			include: ['MockERC20.sol/*.json', 'Pool.sol/*.json'],
			deployments: {
				Pool: {
					[baseSepolia.id]: '0x44432A98ea8dA37F844B89A324204ee6642b785A', // github commit: c3cf1a8
				},
				Droplet: {
					[baseSepolia.id]: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
				},
			},
		}),
	],
})
