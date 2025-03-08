"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock } from "lucide-react"
import { PaymentDialog } from "./payment-dialog"
import { TransactionHistory } from "./transaction-history"

interface BillingSectionProps {
  onPayment: (amount: number, currency: string) => void
}

export function BillingSection({ onPayment }: BillingSectionProps) {
  const transactions = [
    { date: "2025-03-06", amount: "50.00", currency: "AKT", status: "Completed" },
    { date: "2025-03-01", amount: "100.00", currency: "ATOM", status: "Completed" },
    { date: "2025-02-25", amount: "25.00", currency: "AKT", status: "Completed" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Billing & Usage</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-gray-800/50 border-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Balance</p>
              <h3 className="text-2xl font-bold text-white">245.32 AKT</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-800/50 border-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <TrendingDown className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Usage</p>
              <h3 className="text-2xl font-bold text-white">32.18 AKT</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-800/50 border-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Daily Cost</p>
              <h3 className="text-2xl font-bold text-white">1.07 AKT</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gray-800/50 border-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Payment History</h3>
          <PaymentDialog onPayment={onPayment} />
        </div>
        <TransactionHistory transactions={transactions} />
      </Card>
    </div>
  )
}

