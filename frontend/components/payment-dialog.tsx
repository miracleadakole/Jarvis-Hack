"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PaymentDialogProps {
  onPayment: (amount: number, currency: string) => void
}

export function PaymentDialog({ onPayment }: PaymentDialogProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<"AKT" | "ATOM">("AKT")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    const paymentAmount = Number.parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
      })
      return
    }

    setIsProcessing(true)
    try {
      if (selectedCurrency === "ATOM") {
        await convertAndTransfer(paymentAmount)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        onPayment(paymentAmount, selectedCurrency)
      }
      setIsPaymentOpen(false)
      toast({
        title: "Payment Successful",
        description: `Successfully paid ${amount} ${selectedCurrency}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      setAmount("")
    }
  }

  const convertAndTransfer = async (atomAmount: number) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const estimatedAktAmount = atomAmount * 3.45
    onPayment(estimatedAktAmount, "AKT")
  }

  const getExchangeRate = () => {
    return selectedCurrency === "AKT" ? "1 AKT ≈ $0.85" : "1 ATOM ≈ $7.25"
  }

  return (
    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
      <DialogTrigger asChild>
        <Button>Add Funds</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Funds to Your Account</DialogTitle>
          <DialogDescription>Choose your preferred payment currency and enter the amount.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedCurrency === "AKT" ? "default" : "outline"}
              onClick={() => setSelectedCurrency("AKT")}
            >
              Pay with AKT
            </Button>
            <Button
              variant={selectedCurrency === "ATOM" ? "default" : "outline"}
              onClick={() => setSelectedCurrency("ATOM")}
            >
              Pay with ATOM
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16 bg-gray-800 border-gray-700"
                placeholder={`Enter amount in ${selectedCurrency}`}
                disabled={isProcessing}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{selectedCurrency}</div>
            </div>
            <p className="text-sm text-gray-400">{getExchangeRate()}</p>
          </div>

          {amount && !isNaN(Number.parseFloat(amount)) && (
            <motion.div
              className="rounded-lg bg-gray-800 p-4 space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span>
                  {amount} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span>0.001 {selectedCurrency}</span>
              </div>
              <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>
                  {(Number.parseFloat(amount) + 0.001).toFixed(3)} {selectedCurrency}
                </span>
              </div>
            </motion.div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !amount || isNaN(Number.parseFloat(amount))}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${amount || "0"} ${selectedCurrency}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

