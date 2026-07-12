"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Dumbbell, Flame, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around px-2 z-50 pb-safe">
      <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("/dashboard") ? "text-primary" : "text-zinc-500 hover:text-zinc-300"}`}>
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px] font-medium">Início</span>
      </Link>
      <Link href="/treino" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("/treino") ? "text-primary" : "text-zinc-500 hover:text-zinc-300"}`}>
        <Dumbbell className="w-6 h-6" />
        <span className="text-[10px] font-medium">Treino</span>
      </Link>
      <Link href="/dieta" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("/dieta") ? "text-primary" : "text-zinc-500 hover:text-zinc-300"}`}>
        <Flame className="w-6 h-6" />
        <span className="text-[10px] font-medium">Dieta</span>
      </Link>
      <Link href="/perfil" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("/perfil") ? "text-primary" : "text-zinc-500 hover:text-zinc-300"}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">Perfil</span>
      </Link>
    </nav>
  )
}
