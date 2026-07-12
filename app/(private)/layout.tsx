import { Sidebar } from "@/src/components/layout/sidebar"
import { BottomNav } from "@/src/components/layout/bottom-nav"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar para PC */}
      <Sidebar />
      
      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-16 md:pb-0">
        {children}
      </main>

      {/* Tabs para Mobile */}
      <BottomNav />
    </div>
  )
}
