"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface ResourceSearchProps {
  onSearch: (query: string, categories: string[]) => void
}

export function ResourceSearch({ onSearch }: ResourceSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const categories = [
    { id: "compute", label: "Compute" },
    { id: "database", label: "Database" },
    { id: "kubernetes", label: "Kubernetes" },
    { id: "storage", label: "Storage" },
  ]

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSearch = () => {
    onSearch(query, selectedCategories)
  }

  const clearSearch = () => {
    setQuery("")
    setSelectedCategories([])
    onSearch("", [])
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-9 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        <Button onClick={handleSearch}>Search</Button>
        {(query || selectedCategories.length > 0) && (
          <Button variant="ghost" size="icon" onClick={clearSearch}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear all</span>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategories.includes(category.id) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:opacity-80"
            onClick={() => toggleCategory(category.id)}
          >
            {category.label}
            {selectedCategories.includes(category.id) && <X className="ml-1 h-3 w-3" />}
          </Badge>
        ))}
      </div>
    </div>
  )
}

