"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, Check, ExternalLink } from "lucide-react"
import Image from "next/image"

const COSMOS_WALLETS = [
  {
    id: "keplr",
    name: "Keplr Wallet",
    icon: "/placeholder.svg?height=40&width=40",
    description: "The most popular Cosmos wallet extension",
  },
  {
    id: "leap",
    name: "Leap Wallet",
    icon: "/placeholder.svg?height=40&width=40",
    description: "Secure and easy-to-use Cosmos wallet",
  },
  {
    id: "cosmostation",
    name: "Cosmostation",
    icon: "/placeholder.svg?height=40&width=40",
    description: "Mobile and extension wallet for Cosmos",
  },
  {
    id: "akash",
    name: "Akash Wallet",
    icon: "/placeholder.svg?height=40&width=40",
    description: "Official wallet for Akash Network",
  },
]

interface WalletConnectDialogProps {
  onConnect?: (address: string) => void
  children?: React.ReactNode
}

export function WalletConnectDialog({ onConnect, children }: WalletConnectDialogProps) {
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<string | null>(null)
  const { toast } = useToast()

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId)

    try {
      // Simulate wallet connection - in real app, use actual wallet connection logic
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock address
      const mockAddress = `akash${Math.random().toString(36).substring(2, 15)}`

      setConnected(walletId)
      onConnect?.(mockAddress)

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${COSMOS_WALLETS.find((w) => w.id === walletId)?.name}`,
      })

      setTimeout(() => {
        setOpen(false)
      }, 1000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
      })
    } finally {
      setConnecting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Cosmos Wallet</DialogTitle>
          <DialogDescription>Connect your wallet to pay for Akash resources with crypto</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {COSMOS_WALLETS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className={`justify-start h-auto p-4 ${connected === wallet.id ? "border-primary" : ""}`}
              onClick={() => handleConnect(wallet.id)}
              disabled={connecting !== null}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={wallet.icon || "/placeholder.svg"}
                    alt={wallet.name}
                    fill
                    className="rounded-md object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-left">{wallet.name}</h3>
                  <p className="text-sm text-muted-foreground text-left">{wallet.description}</p>
                </div>
                <div className="w-6 flex-shrink-0">
                  {connecting === wallet.id && (
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                  {connected === wallet.id && <Check className="h-5 w-5 text-primary" />}
                </div>
              </div>
            </Button>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto gap-2" asChild>
            <a href="https://akash.network/token" target="_blank" rel="noopener noreferrer">
              Get AKT Tokens
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

