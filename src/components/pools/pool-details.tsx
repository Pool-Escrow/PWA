'use client'

import { Badge } from '@/components/ui/badge'
import { formatPoolBalance, getPoolStatusName } from '@/lib/utils/pool'
import { POOL_STATUSES_CONFIGS } from '@/types/pools'

interface PoolDetailsProps {
  poolData: App.PoolData
  poolItem: App.PoolItem
}

export function PoolDetails({ poolData, poolItem }: PoolDetailsProps) {
  const statusConfig = POOL_STATUSES_CONFIGS[poolData.poolStatus]

  return (
    <div className="space-y-6 p-4">
      {/* Pool Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{poolItem.name}</h1>
          <Badge
            style={{ backgroundColor: statusConfig.color }}
            className="text-white"
          >
            {getPoolStatusName(poolData.poolStatus)}
          </Badge>
        </div>

        <p className="text-gray-600">{poolItem.description}</p>
      </div>

      {/* Pool Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-medium text-gray-500">Participants</h3>
          <p className="text-2xl font-bold text-gray-900">{poolData.participants.length}</p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-medium text-gray-500">Total Deposits</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatPoolBalance(poolData.poolBalance.totalDeposits)}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-medium text-gray-500">Current Balance</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatPoolBalance(poolData.poolBalance.balance)}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-medium text-gray-500">Sponsored</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatPoolBalance(poolData.poolBalance.sponsored)}
          </p>
        </div>
      </div>

      {/* Pool Details */}
      <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Pool Details</h2>

        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-2
        `}
        >
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Host</h3>
            <p className="font-mono text-gray-900">
              {poolData.poolAdmin.host.slice(0, 6)}
              ...
              {poolData.poolAdmin.host.slice(-4)}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Token</h3>
            <p className="font-mono text-gray-900">
              {poolData.poolToken.slice(0, 6)}
              ...
              {poolData.poolToken.slice(-4)}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Deposit per Person</h3>
            <p className="text-gray-900">
              {formatPoolBalance(poolData.poolDetail.depositAmountPerPerson)}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Penalty Fee Rate</h3>
            <p className="text-gray-900">
              {(poolData.poolAdmin.penaltyFeeRate / 100).toFixed(2)}
              %
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Start Date</h3>
            <p className="text-gray-900">
              {new Date(poolData.poolDetail.timeStart * 1000).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">End Date</h3>
            <p className="text-gray-900">
              {new Date(poolData.poolDetail.timeEnd * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Winners Section */}
      {poolData.winners.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Winners</h2>
          <div className="space-y-2">
            {poolData.winners.map((winner, index) => (
              <div key={winner} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">
                    #
                    {index + 1}
                  </span>
                  <span className="font-mono text-gray-900">
                    {winner.slice(0, 6)}
                    ...
                    {winner.slice(-4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fees Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Fees</h2>
        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-2
        `}
        >
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Accumulated</h3>
            <p className="text-gray-900">
              {formatPoolBalance(poolData.poolBalance.feesAccumulated)}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Collected</h3>
            <p className="text-gray-900">
              {formatPoolBalance(poolData.poolBalance.feesCollected)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
