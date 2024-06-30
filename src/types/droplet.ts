//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Droplet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b)
 */
export const dropletAbi = [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: 'spender', internalType: 'address', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'spender', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
        stateMutability: 'view',
    },
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
    {
        type: 'function',
        inputs: [],
        name: 'name',
        outputs: [{ name: '', internalType: 'string', type: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', internalType: 'string', type: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'from', internalType: 'address', type: 'address' },
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'owner',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'spender',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'value',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'Approval',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'from', internalType: 'address', type: 'address', indexed: true },
            { name: 'to', internalType: 'address', type: 'address', indexed: true },
            {
                name: 'value',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'Transfer',
    },
    {
        type: 'error',
        inputs: [
            { name: 'spender', internalType: 'address', type: 'address' },
            { name: 'allowance', internalType: 'uint256', type: 'uint256' },
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'ERC20InsufficientAllowance',
    },
    {
        type: 'error',
        inputs: [
            { name: 'sender', internalType: 'address', type: 'address' },
            { name: 'balance', internalType: 'uint256', type: 'uint256' },
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'ERC20InsufficientBalance',
    },
    {
        type: 'error',
        inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
        name: 'ERC20InvalidApprover',
    },
    {
        type: 'error',
        inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
        name: 'ERC20InvalidReceiver',
    },
    {
        type: 'error',
        inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
        name: 'ERC20InvalidSender',
    },
    {
        type: 'error',
        inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
        name: 'ERC20InvalidSpender',
    },
] as const

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b)
 */
export const dropletAddress = {
    8453: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    84532: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
} as const

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b)
 */
export const dropletConfig = {
    address: dropletAddress,
    abi: dropletAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockErc20Abi = [
    {
        type: 'function',
        inputs: [],
        name: 'DOMAIN_SEPARATOR',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: 'spender', internalType: 'address', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'spender', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'name_', internalType: 'string', type: 'string' },
            { name: 'symbol_', internalType: 'string', type: 'string' },
            { name: 'decimals_', internalType: 'uint8', type: 'uint8' },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'name',
        outputs: [{ name: '', internalType: 'string', type: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: '', internalType: 'address', type: 'address' }],
        name: 'nonces',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: 'spender', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'deadline', internalType: 'uint256', type: 'uint256' },
            { name: 'v', internalType: 'uint8', type: 'uint8' },
            { name: 'r', internalType: 'bytes32', type: 'bytes32' },
            { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'permit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', internalType: 'string', type: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'from', internalType: 'address', type: 'address' },
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'owner',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'spender',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'value',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'Approval',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'from', internalType: 'address', type: 'address', indexed: true },
            { name: 'to', internalType: 'address', type: 'address', indexed: true },
            {
                name: 'value',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'Transfer',
    },
] as const
