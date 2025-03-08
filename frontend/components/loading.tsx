import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <h2 className="mt-4 text-xl font-semibold">Loading Jarvis</h2>
      <p className="text-gray-500">Connecting to Akash Cloud...</p>
    </div>
  )
}

