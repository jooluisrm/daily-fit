"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Dumbbell, Flame, User, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-zinc-800 bg-zinc-950 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Dumbbell className="text-primary-foreground w-4 h-4" />
        </div>
        <span className="text-white font-bold tracking-tight text-xl">Daily Fit</span>
      </div>

      <nav className="flex-1 space-y-2">
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive("/dashboard") ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
          <LayoutDashboard className={`w-5 h-5 ${isActive("/dashboard") ? "text-primary" : ""}`} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/treino" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive("/treino") ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
          <Dumbbell className={`w-5 h-5 ${isActive("/treino") ? "text-primary" : ""}`} />
          <span className="font-medium">Treino</span>
        </Link>
        <Link href="/dieta" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive("/dieta") ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
          <Flame className={`w-5 h-5 ${isActive("/dieta") ? "text-primary" : ""}`} />
          <span className="font-medium">Dieta</span>
        </Link>
        <Link href="/perfil" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive("/perfil") ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
          <User className={`w-5 h-5 ${isActive("/perfil") ? "text-primary" : ""}`} />
          <span className="font-medium">Perfil</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-zinc-800 pt-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-primary font-bold uppercase overflow-hidden relative">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (session?.user as any)?.firstName?.[0] || session?.user?.email?.[0] || "U"
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-white truncate">
              {((session?.user as any)?.firstName && (session?.user as any)?.lastName) 
                ? `${(session?.user as any).firstName} ${(session?.user as any).lastName}`
                : (session?.user as any)?.firstName 
                  ? (session?.user as any).firstName 
                  : "Novo Usuário"}
            </span>
            <span className="text-xs text-zinc-500 truncate">
              {session?.user?.email}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
