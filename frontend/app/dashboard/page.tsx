"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VoiceControl from "@/components/voice-control"
import ResourceList from "@/components/resource-list"
import DeploymentStats from "@/components/deployment-stats"
import VoiceSelector from "@/components/voice-selector"
import { useToast } from "@/components/ui/use-toast"
import { CreateResourceDialog } from "@/components/create-resource-dialog"
import { ResourceSearch } from "@/components/resource-search"
import { motion } from "framer-motion"
import { Wallet } from "lucide-react"
import { BillingSection } from "@/components/billing-section"
import { useWalletStore } from "@/lib/store"

// Define the Resource type
interface Resource {
  id: number
  name: string
  type: string
  status: string
  cpu: string
  memory: string
  storage: string
  cost: string
}

export default function Dashboard() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const { address: connectedWallet, setAddress } = useWalletStore()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!connectedWallet) {
      router.push("/login")
    }

    const fetchResources = async () => {
      try {
        // Simulate API call
        const response = await new Promise<Resource[]>((resolve) => {
          setTimeout(() => {
            const mockResources: Resource[] = [
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
            resolve(mockResources)
          }, 1500)
        })

        setResources(response)
        setFilteredResources(response)
      } catch (error) {
        console.error("Error fetching resources:", error)
        toast({
          variant: "destructive",
          title: "Failed to load resources",
          description: "There was an error loading your resources. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [router, connectedWallet, toast])

  const handleVoiceCommand = (command: string) => {
    try {
      const parsedCommand = JSON.parse(command)

      if (
        parsedCommand.action === "create_vm" ||
        parsedCommand.action === "create_storage" ||
        parsedCommand.action === "create_k8s"
      ) {
        const resourceType =
          parsedCommand.action === "create_vm"
            ? "compute"
            : parsedCommand.action === "create_storage"
              ? "storage"
              : "kubernetes"

        const details = parsedCommand.details

        // Create a new resource based on voice command
        const newResource = generateMockResource({
          name: `Voice Created ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`,
          type: resourceType,
          cpu: details.cpu?.toString() || "2",
          memory: details.memory?.toString() || "4",
          storage: details.size?.toString() || "20",
        })

        addNewResource(newResource)
      }
    } catch (error) {
      // If command is not JSON, process it as a string
      if (command.toLowerCase().includes("create") || command.toLowerCase().includes("deploy")) {
        const newResource = generateMockResource({
          name: "Voice Created Resource",
          type: "compute",
        })
        addNewResource(newResource)
      }
    }
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

  const handlePayment = (amount: number, currency: string) => {
    console.log(`Processing payment of ${amount} ${currency}`)
    toast({
      title: "Payment Successful",
      description: `You have successfully paid ${amount} ${currency}.`,
    })
  }

  // Function to generate a mock resource with default values
  const generateMockResource = (data: Partial<Resource>): Resource => {
    const newId = resources.length > 0 ? Math.max(...resources.map((r) => r.id)) + 1 : 1

    return {
      id: newId,
      name: data.name || "New Resource",
      type: data.type || "compute",
      status: "provisioning", // New resources start in provisioning state
      cpu: data.cpu || "2",
      memory: data.memory ? `${data.memory}GB` : "4GB",
      storage: data.storage ? `${data.storage}GB` : "20GB",
      cost: `${(Math.random() * 0.1 + 0.01).toFixed(2)} AKT/hr`,
    }
  }

  // Function to add a new resource
  const addNewResource = async (newResource: Resource) => {
    // Immediately update the UI with the new resource
    const updatedResources = [...resources, newResource]
    setResources(updatedResources)
    setFilteredResources(updatedResources)

    // Show toast notification
    toast({
      title: "Resource Created",
      description: `${newResource.name} is being provisioned.`,
    })

    // Simulate API call to create resource
    try {
      // This would be a real API call in production
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate resource becoming active after a delay
      setTimeout(() => {
        setResources((prev) =>
          prev.map((resource) => (resource.id === newResource.id ? { ...resource, status: "active" } : resource)),
        )
        setFilteredResources((prev) =>
          prev.map((resource) => (resource.id === newResource.id ? { ...resource, status: "active" } : resource)),
        )

        toast({
          title: "Resource Active",
          description: `${newResource.name} is now active and ready to use.`,
        })
      }, 5000)
    } catch (error) {
      console.error("Error creating resource:", error)
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "There was an error creating your resource. Please try again.",
      })

      // Remove the resource from the UI if the API call fails
      setResources((prev) => prev.filter((r) => r.id !== newResource.id))
      setFilteredResources((prev) => prev.filter((r) => r.id !== newResource.id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Jarvis</h1>
              <p className="text-gray-400 mt-1">Manage your cloud resources with voice commands</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <VoiceSelector onVoiceSelected={setSelectedVoice} />
              {connectedWallet && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-white">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">
                    {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="grid md:grid-cols-[1fr,auto] gap-4 items-start">
            <ResourceSearch onSearch={handleSearch} />
            <CreateResourceDialog onCreateResource={addNewResource} />
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
          <Card className="bg-gray-800 border-0">
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
                    <h2 className="text-lg font-semibold text-white">Deployment Management</h2>
                    <p className="text-gray-400">Manage your Akash deployments and containers</p>
                    <ResourceList
                      resources={filteredResources.filter((r) => r.type === "compute" || r.type === "kubernetes")}
                      isLoading={isLoading}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="billing">
                  <BillingSection onPayment={handlePayment} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

