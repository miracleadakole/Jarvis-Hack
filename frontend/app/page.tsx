import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import Loading from "@/components/loading"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}

