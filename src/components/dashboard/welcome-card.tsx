import { useSession } from "next-auth/react"

export function WelcomeCard() {
  const { data: session } = useSession()

  const firstName = (session?.user as any)?.firstName

  return (
    <div className="flex flex-col gap-1 mb-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Bom dia, {firstName || 'Usuário'}!</h1>
      <p className="text-zinc-400">Pronto para bater suas metas de hoje?</p>
    </div>
  )
}
