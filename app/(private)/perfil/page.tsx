"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Activity } from "lucide-react"
import { PerfilConta } from "@/src/components/perfil/perfil-conta"
import { PerfilCorpo } from "@/src/components/perfil/perfil-corpo"

export default function PerfilPage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full pt-8 md:pt-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Seu Perfil</h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie sua conta e suas medidas corporais</p>
      </div>

      <Tabs defaultValue="conta" className="w-full">
        <TabsList className="flex w-full h-auto bg-zinc-900 border border-zinc-800 rounded-xl mb-8 p-1.5">
          <TabsTrigger 
            value="conta"
            className="flex-1 py-3 rounded-lg text-base font-semibold transition-all data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-md text-zinc-400 hover:text-zinc-200"
          >
            <User className="w-5 h-5 mr-2 hidden sm:inline-block" />
            Conta
          </TabsTrigger>
          <TabsTrigger 
            value="corpo"
            className="flex-1 py-3 rounded-lg text-base font-semibold transition-all data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-md text-zinc-400 hover:text-zinc-200"
          >
            <Activity className="w-5 h-5 mr-2 hidden sm:inline-block" />
            Corpo e Medidas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="conta" className="mt-0 outline-none">
          <PerfilConta />
        </TabsContent>
        
        <TabsContent value="corpo" className="mt-0 outline-none">
          <PerfilCorpo />
        </TabsContent>
      </Tabs>
    </div>
  )
}
