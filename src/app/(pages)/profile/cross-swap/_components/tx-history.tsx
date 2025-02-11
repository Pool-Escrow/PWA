"use client"

import * as React from "react"
import { ChevronRight, X } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import { fetchStatus, tokenAddressToName } from "./utils"

interface Transaction {
  id: string
  date: string
  tokenSymbol: string
  amount: string
  fromToken: string
//   toToken: string
  status: "failed" | "success" | "pending"
}

interface TransactionHistoryProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  networks: string[]
  tokens: string[]
}

export function TransactionHistory({ isOpen, onClose, transactions, networks, tokens}: TransactionHistoryProps) {

  // console.log('tokens', tokens)
  const handleTransactionClick = async (transactionId: string) => {
    try {
      // Simulate API fetch
      await fetchStatus(transactionId).then((res) => {
        console.log('res', res)
      })
      console.log(`Fetching details for transaction ${transactionId}`)
      // Add your fetch logic here
    } catch (error) {
      console.error("Error fetching transaction details:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>History</DialogTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="text-xs">
              Swap & Bridge
            </Button>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="All networks" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network} value={network}>
                  {network.chainName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {transactions.map((transaction) => (
            <Button
              key={transaction.txHash}
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => handleTransactionClick(transaction.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {transaction.tokenSymbol} → {transaction.toToken}
                    </span>
                    <span className="text-sm font-medium">
                      {transaction.amount}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), "MM/dd/yyyy")}
                  </span>
                  <span className="text-xs text-pink-500">{transaction.status}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

