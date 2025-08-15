//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x31a89576534403c33081b7914feb5e70b7a45abe)
 */
export const poolAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WHITELISTED_HOST',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WHITELISTED_SPONSOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
    ],
    name: 'changeEndTime',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'poolName', internalType: 'string', type: 'string' },
    ],
    name: 'changePoolName',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
    ],
    name: 'changeStartTime',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'claimWinning',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimablePools',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'collectFees',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'collectRemainingBalance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
      { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
      { name: 'poolName', internalType: 'string', type: 'string' },
      {
        name: 'depositAmountPerPerson',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'penaltyFeeRate', internalType: 'uint16', type: 'uint16' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'createPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createdPools',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'deletePool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'enableDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'endPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'forfeitWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAllPoolInfo',
    outputs: [
      {
        name: '_poolAdmin',
        internalType: 'struct IPool.PoolAdmin',
        type: 'tuple',
        components: [
          { name: 'host', internalType: 'address', type: 'address' },
          { name: 'penaltyFeeRate', internalType: 'uint16', type: 'uint16' },
        ],
      },
      {
        name: '_poolDetail',
        internalType: 'struct IPool.PoolDetail',
        type: 'tuple',
        components: [
          { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
          { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
          { name: 'poolName', internalType: 'string', type: 'string' },
          {
            name: 'depositAmountPerPerson',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
      {
        name: '_poolBalance',
        internalType: 'struct IPool.PoolBalance',
        type: 'tuple',
        components: [
          { name: 'totalDeposits', internalType: 'uint256', type: 'uint256' },
          { name: 'feesAccumulated', internalType: 'uint256', type: 'uint256' },
          { name: 'feesCollected', internalType: 'uint256', type: 'uint256' },
          { name: 'balance', internalType: 'uint256', type: 'uint256' },
          { name: 'sponsored', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_poolStatus',
        internalType: 'enum IPool.POOLSTATUS',
        type: 'uint8',
      },
      { name: '_poolToken', internalType: 'address', type: 'address' },
      { name: '_participants', internalType: 'address[]', type: 'address[]' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'winner', internalType: 'address', type: 'address' }],
    name: 'getClaimablePools',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bool[]', type: 'bool[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getFeesAccumulated',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getFeesCollected',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getHost',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'participant', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getParticipantDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'participant', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getParticipantDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.ParticipantDetail',
        type: 'tuple',
        components: [
          { name: 'deposit', internalType: 'uint256', type: 'uint256' },
          { name: 'feesCharged', internalType: 'uint256', type: 'uint256' },
          {
            name: 'participantIndex',
            internalType: 'uint120',
            type: 'uint120',
          },
          {
            name: 'joinedPoolsIndex',
            internalType: 'uint120',
            type: 'uint120',
          },
          { name: 'refunded', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getParticipants',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.PoolDetail',
        type: 'tuple',
        components: [
          { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
          { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
          { name: 'poolName', internalType: 'string', type: 'string' },
          {
            name: 'depositAmountPerPerson',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolFeeRate',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'host', internalType: 'address', type: 'address' }],
    name: 'getPoolsCreatedBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'participant', internalType: 'address', type: 'address' }],
    name: 'getPoolsJoinedBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: '_sponsor', internalType: 'address', type: 'address' },
    ],
    name: 'getSponsorDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.SponsorDetail',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSponsors',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSponsorshipAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'getWinnerDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.WinnerDetail',
        type: 'tuple',
        components: [
          { name: 'amountWon', internalType: 'uint256', type: 'uint256' },
          { name: 'amountClaimed', internalType: 'uint256', type: 'uint256' },
          { name: 'timeWon', internalType: 'uint40', type: 'uint40' },
          { name: 'claimed', internalType: 'bool', type: 'bool' },
          { name: 'forfeited', internalType: 'bool', type: 'bool' },
          { name: 'alreadyInList', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getWinners',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getWinnersDetails',
    outputs: [
      { name: '', internalType: 'address[]', type: 'address[]' },
      {
        name: '',
        internalType: 'struct IPool.WinnerDetail[]',
        type: 'tuple[]',
        components: [
          { name: 'amountWon', internalType: 'uint256', type: 'uint256' },
          { name: 'amountClaimed', internalType: 'uint256', type: 'uint256' },
          { name: 'timeWon', internalType: 'uint40', type: 'uint40' },
          { name: 'claimed', internalType: 'bool', type: 'bool' },
          { name: 'forfeited', internalType: 'bool', type: 'bool' },
          { name: 'alreadyInList', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'getWinningAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isHost',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isParticipant',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'joinedPools',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestPoolId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'participantDetail',
    outputs: [
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'feesCharged', internalType: 'uint256', type: 'uint256' },
      { name: 'participantIndex', internalType: 'uint120', type: 'uint120' },
      { name: 'joinedPoolsIndex', internalType: 'uint120', type: 'uint120' },
      { name: 'refunded', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'participants',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolAdmin',
    outputs: [
      { name: 'host', internalType: 'address', type: 'address' },
      { name: 'penaltyFeeRate', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolBalance',
    outputs: [
      { name: 'totalDeposits', internalType: 'uint256', type: 'uint256' },
      { name: 'feesAccumulated', internalType: 'uint256', type: 'uint256' },
      { name: 'feesCollected', internalType: 'uint256', type: 'uint256' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'sponsored', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolDetail',
    outputs: [
      { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
      { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
      { name: 'poolName', internalType: 'string', type: 'string' },
      {
        name: 'depositAmountPerPerson',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolStatus',
    outputs: [
      { name: '', internalType: 'enum IPool.POOLSTATUS', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'reenableDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'participant', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'refundParticipant',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'selfRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setWinner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'setWinners',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sponsor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sponsorDetail',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sponsors',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'startPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'winnerDetail',
    outputs: [
      { name: 'amountWon', internalType: 'uint256', type: 'uint256' },
      { name: 'amountClaimed', internalType: 'uint256', type: 'uint256' },
      { name: 'timeWon', internalType: 'uint40', type: 'uint40' },
      { name: 'claimed', internalType: 'bool', type: 'bool' },
      { name: 'forfeited', internalType: 'bool', type: 'bool' },
      { name: 'alreadyInList', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'winners',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExtraDeposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'fees',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeesCharged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'host', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'fees',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeesCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'JoinedPoolsRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ParticipantRejoined',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ParticipantRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'balanceBefore',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'balanceAfter',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PoolBalanceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'host', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'poolName',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'depositAmountPerPerson',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'penaltyFeeRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PoolCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'endTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PoolEndTimeChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'poolName',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'PoolNameChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'startTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PoolStartTimeChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'status',
        internalType: 'enum IPool.POOLSTATUS',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PoolStatusChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Refund',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'host', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RemainingBalanceCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SponsorshipAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinnerSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinningForfeited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinningsClaimed',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'timeNow', internalType: 'uint256', type: 'uint256' },
      { name: 'timeStart', internalType: 'uint256', type: 'uint256' },
      { name: 'caller', internalType: 'address', type: 'address' },
    ],
    name: 'EventStarted',
  },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'Unauthorized',
  },
] as const

/**
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x31a89576534403c33081b7914feb5e70b7a45abe)
 */
export const poolAddress = {
  84532: '0x31a89576534403c33081b7914FEb5e70b7a45abe',
} as const

/**
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x31a89576534403c33081b7914feb5e70b7a45abe)
 */
export const poolConfig = { address: poolAddress, abi: poolAbi } as const
