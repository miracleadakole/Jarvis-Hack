"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnectDialog } from "@/components/wallet-connect-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useWalletStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const setAddress = useWalletStore((state) => state.setAddress)

  const handleConnect = async (address: string) => {
    try {
      setAddress(address)
      toast({
        title: "Wallet Connected",
        description: "You have successfully signed in.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "There was an error signing in. Please try again.",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-[350px] bg-gray-800 border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Login to Jarvis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6 text-gray-400">Connect your wallet to access Jarvis Cloud Manager</p>
          <WalletConnectDialog onConnect={handleConnect}>
            <Button className="w-full">Connect Wallet</Button>
          </WalletConnectDialog>
        </CardContent>
      </Card>
    </div>
  )
}

