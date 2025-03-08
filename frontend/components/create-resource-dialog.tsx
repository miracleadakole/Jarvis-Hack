"use client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Server, Database, Layers, Cpu } from "lucide-react"

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

interface CreateResourceDialogProps {
  onCreateResource: (resource: Resource) => void
}

export function CreateResourceDialog({ onCreateResource }: CreateResourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [resourceTab, setResourceTab] = useState("compute")
  const [formData, setFormData] = useState({
    name: "",
    region: "us-west",
    cpu: 2,
    memory: 4,
    storage: 20,
    highAvailability: false,
    dbType: "postgres",
    k8sVersion: "1.25",
    nodeCount: 3,
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please provide a name for your resource.",
      })
      return
    }

    // Generate a new resource based on form data
    const newResource: Resource = {
      id: Math.floor(Math.random() * 10000), // Temporary ID until backend assigns one
      name: formData.name,
      type: resourceTab,
      status: "provisioning",
      cpu: formData.cpu.toString(),
      memory: `${formData.memory}GB`,
      storage: `${formData.storage}GB`,
      cost: `${(Math.random() * 0.1 + 0.01).toFixed(2)} AKT/hr`,
    }

    // Call the onCreateResource function passed from parent
    onCreateResource(newResource)

    setOpen(false)

    // Reset form
    setFormData({
      name: "",
      region: "us-west",
      cpu: 2,
      memory: 4,
      storage: 20,
      highAvailability: false,
      dbType: "postgres",
      k8sVersion: "1.25",
      nodeCount: 3,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Resource</DialogTitle>
          <DialogDescription>Configure your new Akash cloud resource</DialogDescription>
        </DialogHeader>

        <Tabs value={resourceTab} onValueChange={setResourceTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="compute" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">Compute</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger value="kubernetes" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Kubernetes</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Storage</span>
            </TabsTrigger>
          </TabsList>

          {/* Common fields for all resource types */}
          <div className="grid gap-4 py-4 mb-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700"
                placeholder="my-resource"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Region
              </Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="us-west">US West</SelectItem>
                  <SelectItem value="us-east">US East</SelectItem>
                  <SelectItem value="eu-central">EU Central</SelectItem>
                  <SelectItem value="asia-east">Asia East</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="compute" className="space-y-4 animate-in fade-in-50">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpu" className="text-right">
                CPU Cores: {formData.cpu}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="cpu"
                  min={1}
                  max={16}
                  step={1}
                  value={[formData.cpu]}
                  onValueChange={(value) => handleInputChange("cpu", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memory" className="text-right">
                Memory (GB): {formData.memory}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="memory"
                  min={1}
                  max={64}
                  step={1}
                  value={[formData.memory]}
                  onValueChange={(value) => handleInputChange("memory", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="storage" className="text-right">
                Storage (GB): {formData.storage}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="storage"
                  min={10}
                  max={1000}
                  step={10}
                  value={[formData.storage]}
                  onValueChange={(value) => handleInputChange("storage", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-4 animate-in fade-in-50">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dbType" className="text-right">
                Database Type
              </Label>
              <Select value={formData.dbType} onValueChange={(value) => handleInputChange("dbType", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ha-switch" className="text-right">
                High Availability
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="ha-switch"
                  checked={formData.highAvailability}
                  onCheckedChange={(checked) => handleInputChange("highAvailability", checked)}
                />
                <Label htmlFor="ha-switch">{formData.highAvailability ? "Enabled" : "Disabled"}</Label>
              </div>
            </div>
            {/* Include CPU, Memory, Storage sliders from Compute tab */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="db-cpu" className="text-right">
                CPU Cores: {formData.cpu}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="db-cpu"
                  min={1}
                  max={16}
                  step={1}
                  value={[formData.cpu]}
                  onValueChange={(value) => handleInputChange("cpu", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="db-memory" className="text-right">
                Memory (GB): {formData.memory}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="db-memory"
                  min={1}
                  max={64}
                  step={1}
                  value={[formData.memory]}
                  onValueChange={(value) => handleInputChange("memory", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="db-storage" className="text-right">
                Storage (GB): {formData.storage}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="db-storage"
                  min={10}
                  max={1000}
                  step={10}
                  value={[formData.storage]}
                  onValueChange={(value) => handleInputChange("storage", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kubernetes" className="space-y-4 animate-in fade-in-50">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="k8sVersion" className="text-right">
                K8s Version
              </Label>
              <Select value={formData.k8sVersion} onValueChange={(value) => handleInputChange("k8sVersion", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Kubernetes version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.25">1.25</SelectItem>
                  <SelectItem value="1.24">1.24</SelectItem>
                  <SelectItem value="1.23">1.23</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nodeCount" className="text-right">
                Node Count: {formData.nodeCount}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="nodeCount"
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.nodeCount]}
                  onValueChange={(value) => handleInputChange("nodeCount", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="k8s-cpu" className="text-right">
                CPU per Node: {formData.cpu}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="k8s-cpu"
                  min={2}
                  max={16}
                  step={2}
                  value={[formData.cpu]}
                  onValueChange={(value) => handleInputChange("cpu", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="k8s-memory" className="text-right">
                Memory per Node (GB): {formData.memory}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="k8s-memory"
                  min={4}
                  max={64}
                  step={4}
                  value={[formData.memory]}
                  onValueChange={(value) => handleInputChange("memory", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4 animate-in fade-in-50">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="storage-type" className="text-right">
                Storage Type
              </Label>
              <Select defaultValue="block">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select storage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block Storage</SelectItem>
                  <SelectItem value="object">Object Storage</SelectItem>
                  <SelectItem value="file">File Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="storage-size" className="text-right">
                Size (GB): {formData.storage}
              </Label>
              <div className="col-span-3">
                <Slider
                  id="storage-size"
                  min={10}
                  max={5000}
                  step={10}
                  value={[formData.storage]}
                  onValueChange={(value) => handleInputChange("storage", value[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="storage-ha" className="text-right">
                Redundancy
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="storage-ha"
                  checked={formData.highAvailability}
                  onCheckedChange={(checked) => handleInputChange("highAvailability", checked)}
                />
                <Label htmlFor="storage-ha">{formData.highAvailability ? "Redundant" : "Standard"}</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name}>
            Create Resource
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

