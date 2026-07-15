"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { DashboardSkeletons } from "@/src/components/dashboard/dashboard-skeletons"

const DashboardContent = dynamic(() => import("./dashboard-content"), { 
  ssr: false,
  loading: () => <DashboardSkeletons />
})

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8">
      <Suspense fallback={<DashboardSkeletons />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
