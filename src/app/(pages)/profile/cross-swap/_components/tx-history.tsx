"use client"

import * as React from "react"
import { ChevronRight, X } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import { fetchStatus, tokenAddressToName } from "./utils"
import { useState, useEffect } from "react"
import { String } from "lodash"

interface Transaction {
  id: string
  date: string
  fromChain: object
  toChain: object
  amount: string
  toAmount: string
  fromToken: object
  toToken: object
  toTxnHash: string
  status: string
}

interface TransactionHistoryProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction []
  networks: string[]
  tokens: string[]
}

export function TransactionHistory({ isOpen, onClose, transactions, networks, tokens }: TransactionHistoryProps) {
  const [successfulTransactions, setSuccessfulTransactions] = useState<Transaction[]>([]);
  const txnIds = transactions.map((txn) => txn.id);

  // Delay function

   // Runs only when modal opens

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
              key={transaction.id}
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => console.log(`Fetching details for transaction ${transaction.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {transaction.fromChain.name} | {transaction.fromToken.name} → {transaction.toChain.name} | {transaction.toToken.name}
                    </span>
                    <span className="text-sm font-medium">
                      {transaction.amount}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {transaction.date}
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