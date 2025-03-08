"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VoiceControl from "@/components/voice-control"
import ResourceList from "@/components/resource-list"
import DeploymentStats from "@/components/deployment-stats"
import VoiceSelector from "@/components/voice-selector"
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { CreateResourceDialog } from "@/components/create-resource-dialog"
import { WalletConnectDialog } from "@/components/wallet-connect-dialog"
import { ResourceSearch } from "@/components/resource-search"
import { motion } from "framer-motion"
import { Wallet } from "lucide-react"
import { BillingSection } from "./billing-section"

export default function Dashboard() {
  const [resources, setResources] = useState<any[]>([])
  const [filteredResources, setFilteredResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchResources = async () => {
      setTimeout(() => {
        const mockResources = [
          {
            id: 1,
            name: "Web Server",
            type: "compute",
            status: "active",
            cpu: "2",
            memory: "4GB",
            storage: "20GB",
            cost: "0.02 AKT/hr",
          },
          {
            id: 2,
            name: "Database Cluster",
            type: "database",
            status: "active",
            cpu: "4",
            memory: "8GB",
            storage: "100GB",
            cost: "0.05 AKT/hr",
          },
          {
            id: 3,
            name: "ML Training Job",
            type: "compute",
            status: "scheduled",
            cpu: "8",
            memory: "16GB",
            storage: "50GB",
            cost: "0.10 AKT/hr",
          },
          {
            id: 4,
            name: "Kubernetes Cluster",
            type: "kubernetes",
            status: "active",
            cpu: "12",
            memory: "32GB",
            storage: "200GB",
            cost: "0.15 AKT/hr",
          },
          {
            id: 5,
            name: "Object Storage",
            type: "storage",
            status: "active",
            cpu: "1",
            memory: "2GB",
            storage: "500GB",
            cost: "0.03 AKT/hr",
          },
          {
            id: 6,
            name: "Redis Cache",
            type: "database",
            status: "paused",
            cpu: "2",
            memory: "4GB",
            storage: "10GB",
            cost: "0.02 AKT/hr",
          },
        ]
        setResources(mockResources)
        setFilteredResources(mockResources)
        setIsLoading(false)
      }, 1500)
    }

    fetchResources()
  }, [])

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("list resources") || lowerCommand.includes("show resources")) {
      speakResponse("Here are your current resources on Akash Cloud")
      return
    }

    if (lowerCommand.includes("create") || lowerCommand.includes("deploy")) {
      toast({
        title: "Deployment Initiated",
        description: "Starting deployment process based on your command",
      })
      speakResponse("I'll start the deployment process for you. What would you like to name this resource?")
      return
    }

    if (lowerCommand.includes("status") || lowerCommand.includes("health")) {
      speakResponse("All systems are operational. You have 5 active deployments running on Akash Cloud.")
      return
    }

    speakResponse("I'm not sure how to process that command. Please try again.")
  }

  const speakResponse = (text: string) => {
    if (!selectedVoice) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    window.speechSynthesis.speak(utterance)
  }

  const handleSearch = (query: string, categories: string[]) => {
    if (!query && categories.length === 0) {
      setFilteredResources(resources)
      return
    }

    const filtered = resources.filter((resource) => {
      const matchesQuery =
        query === "" ||
        resource.name.toLowerCase().includes(query.toLowerCase()) ||
        resource.type.toLowerCase().includes(query.toLowerCase())

      const matchesCategories = categories.length === 0 || categories.includes(resource.type)

      return matchesQuery && matchesCategories
    })

    setFilteredResources(filtered)
  }

  const handleWalletConnect = (address: string) => {
    setConnectedWallet(address)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Jarvis</h1>
              <p className="text-muted-foreground mt-1">Manage your cloud resources with voice commands</p>
            </div>
            <div className="flex items-center gap-4">
              <VoiceSelector onVoiceSelected={setSelectedVoice} />
              <ThemeToggle />
              <WalletConnectDialog onConnect={handleWalletConnect}>
                {connectedWallet ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm">
                      {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                    </span>
                  </div>
                ) : null}
              </WalletConnectDialog>
            </div>
          </div>

          {/* Action Bar */}
          <div className="grid md:grid-cols-[1fr,auto] gap-4 items-start">
            <ResourceSearch onSearch={handleSearch} />
            <CreateResourceDialog onCreateResource={function (resource: any): void {
              throw new Error("Function not implemented.")
            } } />
          </div>

          {/* Voice Control */}
          <VoiceControl onCommand={handleVoiceCommand} selectedVoice={selectedVoice} />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-card">
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="deployments">Deployments</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DeploymentStats isLoading={isLoading} resources={filteredResources} />
                    </div>
                    <ResourceList resources={filteredResources} isLoading={isLoading} />
                  </div>
                </TabsContent>

                <TabsContent value="deployments">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Deployment Management</h2>
                    <p className="text-muted-foreground">Manage your Akash deployments and containers</p>
                    <ResourceList
                      resources={filteredResources.filter((r) => r.type === "compute" || r.type === "kubernetes")}
                      isLoading={isLoading}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="billing">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Manage your Bills</p>                  
                    <BillingSection onPayment={function (amount: number, currency: string): void {
                      throw new Error("Function not implemented.")
                    } } />
                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

