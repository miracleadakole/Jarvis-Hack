"use client"

import { motion } from "framer-motion"

interface Transaction {
  date: string
  amount: string
  currency: string
  status: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <motion.div
          key={index}
          className="flex justify-between items-center p-4 rounded-lg bg-gray-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div>
            <p className="text-sm font-medium text-white">
              {transaction.amount} {transaction.currency}
            </p>
            <p className="text-xs text-gray-400">{transaction.date}</p>
          </div>
          <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-full">
            {transaction.status}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

