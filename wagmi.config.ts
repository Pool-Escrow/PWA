import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import { base, baseSepolia } from 'viem/chains'

export default defineConfig({
	out: 'src/lib/contracts/generated.ts',
	// contracts: [],
	plugins: [
		foundry({
			project: 'contracts',
			include: ['MockERC20.sol/*.json', 'Pool.sol/*.json'],
			deployments: {
				Pool: {
					// [anvil.id]: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
					[base.id]: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // NOT SAFE. REPLACE!
					[baseSepolia.id]: '0x44432A98ea8dA37F844B89A324204ee6642b785A', // github commit: c3cf1a8
				},
				Droplet: {
					// [anvil.id]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
					[base.id]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
					[baseSepolia.id]: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
				},
			},
		}),
	],
})
