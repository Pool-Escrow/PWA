'use client'

import * as React from 'react'
import { ChevronRight, X } from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardContent } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/_components/ui/sheet'
import { fetchStatus, tokenAddressToName } from './utils'
import { useState, useEffect, useRef } from 'react'
import { String } from 'lodash'
import Image from 'next/image'

interface Transaction {
    id: string
    date: string
    fromChain: {
        name: string
        chainId: string
    }
    toChain: {
        name: string
        chainId: string
    }
    amount: string
    toAmount: string
    fromToken: {
        name: string
        logo: string
    }
    toToken: {
        name: string
        logo: string
    }
    toTxnHash: string
    status: string
}

interface TransactionHistoryProps {
    isOpen: boolean
    onClose: () => void
    transactions: Transaction[]
    networks: string[]
    tokens: string[]
}

export function TransactionHistory({ isOpen, onClose, transactions, networks, tokens }: TransactionHistoryProps) {
    const [successfulTransactions, setSuccessfulTransactions] = useState<Transaction[]>([])
    const txnIds = transactions.map(txn => txn.id)
    const sheetRef = useRef<HTMLDivElement>(null)
    const dragStartRef = useRef(0)
    const currentDragRef = useRef(0)
    const isDraggingRef = useRef(false)
    const animationFrameRef = useRef<number>()
    const dragThreshold = 150

    const updateSheetPosition = (deltaY: number) => {
        if (sheetRef.current) {
            const transform = `translateY(${Math.max(0, deltaY)}px)`
            sheetRef.current.style.transform = transform
        }
    }

    const handleDragStart = (e: React.PointerEvent) => {
        isDraggingRef.current = true
        dragStartRef.current = e.clientY
        currentDragRef.current = 0

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none'
        }

        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handleDrag = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const deltaY = e.clientY - dragStartRef.current
            currentDragRef.current = deltaY
            updateSheetPosition(deltaY)
        })
    }

    const handleDragEnd = (e: React.PointerEvent) => {
        isDraggingRef.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)'

            if (currentDragRef.current > dragThreshold) {
                onClose()
            } else {
                updateSheetPosition(0)
            }
        }
    }

    React.useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                ref={sheetRef}
                side='bottom'
                className='h-[85vh] touch-none rounded-t-[24px] p-4'
                style={{
                    transform: 'translateY(0)',
                    transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                }}>
                <div
                    className='absolute left-1/2 top-2.5 h-1.5 w-12 -translate-x-1/2 cursor-grab touch-none rounded-full bg-gray-300 active:cursor-grabbing'
                    onPointerDown={handleDragStart}
                    onPointerMove={handleDrag}
                    onPointerUp={handleDragEnd}
                    onPointerCancel={handleDragEnd}
                    role='button'
                    aria-label='Drag to close'
                />
                <SheetHeader className='flex flex-row items-center justify-between pt-4'>
                    <SheetTitle className='text-[18px] font-bold'>Transaction History</SheetTitle>
                    <button onClick={onClose} className='absolute right-6 top-4 text-gray-500 hover:text-gray-700'>
                        <X className='size-6' />
                    </button>
                </SheetHeader>

                <div className='mt-2 space-y-4'>
                    {transactions.map(transaction => (
                        <div key={transaction.id} className='flex items-start justify-between pt-4'>
                            <div className='flex flex-col'>
                                <span className='mb-6 text-[11px] font-medium text-[#8F8F8F]'>
                                    {format(new Date(transaction.date), 'MM/dd/yy')}
                                </span>
                                <div className='flex'>
                                    <div className='flex items-center'>
                                        <div className='relative flex'>
                                            <div className='h-6 w-6 overflow-hidden rounded-full'>
                                                <Image
                                                    src={transaction.fromToken.logo}
                                                    alt={transaction.fromToken.name}
                                                    width={24}
                                                    height={24}
                                                    className='h-full w-full object-cover'
                                                />
                                            </div>
                                            <div className='-ml-2 h-6 w-6 overflow-hidden rounded-full'>
                                                <Image
                                                    src={transaction.toToken.logo}
                                                    alt={transaction.toToken.name}
                                                    width={24}
                                                    height={24}
                                                    className='h-full w-full object-cover'
                                                />
                                            </div>
                                        </div>
                                        <div className='ml-3'>
                                            <div className='flex items-center text-[14px] font-medium text-[#383838]'>
                                                <span>{transaction.fromToken.name}</span>
                                                <span className='mx-2'>→</span>
                                                <span>{transaction.toToken.name}</span>
                                            </div>
                                            <div className='text-[12px] text-[#8F8F8F]'>
                                                {transaction.fromChain.name} to {transaction.toChain.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-[42px] flex h-8 flex-col items-end justify-center'>
                                {transaction.status !== 'SUCCESS' ? (
                                    <div className='flex flex-col items-end'>
                                        <span className='mb-1 text-[12px] text-[#FF9900]'>In progress</span>
                                        <div className='flex items-center'>
                                            <span className='text-[14px] font-medium text-[#8F8F8F]'>21 min</span>
                                            <ChevronRight className='ml-2 h-4 w-4 text-[#8F8F8F]' />
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-end'>
                                        <div className='flex items-center'>
                                            <div className='flex flex-col items-end'>
                                                <span className='text-[14px] font-medium text-[#5FBA6E]'>
                                                    +{transaction.amount} {transaction.toToken.name}
                                                </span>
                                                <span className='text-[12px] text-[#8F8F8F]'>
                                                    -{transaction.amount} {transaction.fromToken.name}
                                                </span>
                                            </div>
                                            <ChevronRight className='ml-2 h-4 w-4 text-[#8F8F8F]' />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
