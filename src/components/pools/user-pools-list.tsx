'use client'

import { usePrivy } from '@privy-io/react-auth'
import { ChevronRightIcon } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useUserPools } from '@/hooks/use-pools'
import { Button } from '../ui/button'
import PoolListCard from './pools-list-item'

export default function UserPoolsList() {
  const { ready, authenticated, login } = usePrivy()
  const { data, isLoading, isError } = useUserPools()
  const hasNextPool = data?.pools && data.pools.length > 0

  return (
    <div className="detail_card_bg rounded-[2rem] p-3 pt-[18px]">
      <div className="flex shrink justify-between">
        <h1 className="pl-[6px] text-lg font-semibold">Your Pools</h1>
        {ready && authenticated && (
          <Link href="/my-pools" className="inline-flex h-[30px] items-center gap-1 pr-[6px]">
            <motion.div
              className="text-[11px] font-semibold text-pool-blue"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.div>
            <motion.div
              className="flex size-[30px] items-center justify-center rounded-full bg-white"
              whileHover={{ scale: 1.05, backgroundColor: '#f0f0f0' }}
              whileTap={{ scale: 0.95, backgroundColor: '#e5e5e5' }}
            >
              <ChevronRightIcon className="size-6 text-pool-blue" />
            </motion.div>
          </Link>
        )}
      </div>
      <div className="mt-4">
        {!ready
          ? (
              <motion.div
                className="flex h-24 items-center justify-center rounded-3xl bg-white p-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-sm font-semibold">Loading...</h2>
                  <p className="text-xs text-gray-600">Initializing authentication</p>
                </div>
              </motion.div>
            )
          : !authenticated
              ? (
                  <motion.div
                    className="flex h-24 items-center justify-center rounded-3xl bg-white p-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <h2 className="text-sm font-semibold">Welcome to Pool</h2>
                      <p className="text-xs text-gray-600">Ready to dive into your pool journey?</p>
                      <Button
                        variant="link"
                        onClick={login}
                        className={`
                          mt-1 text-xs text-pool-blue
                          hover:underline
                        `}
                      >
                        Login to view your pools
                      </Button>
                    </div>
                  </motion.div>
                )
              : (
                  <div className="flex flex-col space-y-2 select-none">
                    {isLoading
                      ? (
                          <motion.div
                            className="flex h-24 items-center justify-center rounded-3xl bg-white p-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <h2 className="text-sm font-semibold">Loading your pools...</h2>
                            </div>
                          </motion.div>
                        )
                      : isError
                        ? (
                            <motion.div
                              className="flex h-24 items-center justify-center rounded-3xl bg-white p-4"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <h2 className="text-sm font-semibold">Unable to load pools</h2>
                                <p className="text-xs text-gray-600">Please try again later</p>
                              </div>
                            </motion.div>
                          )
                        : hasNextPool
                          ? (
                              data?.pools.map(pool => (
                                <PoolListCard key={pool.id} {...pool} />
                              ))
                            )
                          : (
                              <motion.div
                                className="flex h-24 items-center justify-center rounded-3xl bg-white p-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <h2 className="text-sm font-semibold">Welcome to Pool</h2>
                                  <p className="text-xs text-gray-600">You&apos;re ready to dive in!</p>
                                  <p className="text-xs text-gray-500">Register to an upcoming pool below.</p>
                                </div>
                              </motion.div>
                            )}
                  </div>
                )}
      </div>
    </div>
  )
}
