import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/lib/contracts/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      deployments: {
        Pool: {
        84532: '0x31a89576534403c33081b7914feb5e70b7a45abe',
        },
      },
      project: './contracts',
      include: [
        // Only include the pool main contract
        'Pool.sol/**',
      ],
      exclude: [
        // Exclude test files and dependencies
        'test/**',
        'script/**',
        'lib/**',
        'dependencies/**',
      ],
    }),
  ],
})
