"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

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
    <div className="flex flex-col gap-1 mb-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">{greeting}, {firstName || 'Usuário'}</h1>
      <p className="text-zinc-400">Pronto para bater suas metas de hoje?</p>
    </div>
  )
}
