import { Button } from '@/app/_components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/_components/ui/sheet'
import { useState } from 'react'
import type { OKXNetwork, OKXToken, Transaction } from '../types'
import { useTransactionHistory } from './hooks/useTransactionHistory'

interface TransactionHistoryButtonProps {
    walletAddress?: string
    fetchedNetworks: OKXNetwork[]
    fetchedTokens: OKXToken[]
    transactions: Transaction[]
}

export const TransactionHistoryButton = ({
    walletAddress,
    fetchedNetworks,
    fetchedTokens,
}: TransactionHistoryButtonProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const { refetchTransactions } = useTransactionHistory({
        fetchedNetworks,
        fetchedTokens,
        walletAddress,
    })

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                        setIsOpen(true)
                        void refetchTransactions()
                    }}>
                    Transaction History
                </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-full sm:max-w-lg'>
                <SheetHeader>
                    <SheetTitle>Transaction History</SheetTitle>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}
