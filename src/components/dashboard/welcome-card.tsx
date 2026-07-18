"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function WelcomeCard() {
  const { data: session } = useSession()
  const [greeting, setGreeting] = useState("Olá")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("Bom dia")
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde")
    else setGreeting("Boa noite")
  }, [])

  const firstName = (session?.user as any)?.firstName

  return (
    <div className="flex flex-col gap-2 mb-2 p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/50 shadow-sm relative overflow-hidden group transition-all hover:border-zinc-700/50">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all group-hover:bg-primary/10" />
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          {greeting}, {firstName || 'Usuário'}
          <Sparkles className="w-6 h-6 text-primary/70 animate-pulse" />
        </h1>
        <p className="text-zinc-400 mt-1 text-base">Pronto para bater suas metas de hoje?</p>
      </div>
    </div>
  )
}
