"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Play, Pause, Trash2, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

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

interface ResourceListProps {
  resources: Resource[]
  isLoading: boolean
}

export default function ResourceList({ resources, isLoading }: ResourceListProps) {
  if (isLoading) {
    return <ResourceListSkeleton />
  }

  return (
    <div className="rounded-md border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resources</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow className="border-gray-700">
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No resources found. Use voice command or the Create Resource button to add a new deployment.
              </TableCell>
            </TableRow>
          ) : (
            resources.map((resource, index) => (
              <motion.tr
                key={resource.id}
                className="border-b border-gray-700 transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-gray-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <TableCell className="font-medium">
                  {resource.name}
                  {resource.status === "provisioning" && (
                    <span className="ml-2 text-xs text-blue-400 animate-pulse">Provisioning...</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {resource.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={resource.status} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="inline-block mr-2">{resource.cpu} CPU</span>
                    <span className="inline-block mr-2">{resource.memory} RAM</span>
                    <span className="inline-block">{resource.storage} Storage</span>
                  </div>
                </TableCell>
                <TableCell>{resource.cost}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={resource.status === "provisioning"}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-800" />
                      <DropdownMenuItem className="cursor-pointer">
                        <Play className="mr-2 h-4 w-4" /> Start
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800" />
                      <DropdownMenuItem className="text-red-600 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

  switch (status) {
    case "active":
      variant = "default"
      break
    case "paused":
      variant = "secondary"
      break
    case "error":
      variant = "destructive"
      break
    case "provisioning":
      variant = "outline"
      break
    default:
      variant = "outline"
  }

  return (
    <Badge
      variant={variant}
      className={`capitalize ${status === "provisioning" ? "bg-blue-500/10 text-blue-400 animate-pulse" : ""}`}
    >
      {status}
    </Badge>
  )
}

function ResourceListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  )
}

