"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TreinoToday } from "@/src/components/treino/treino-today"
import { TreinoList } from "@/src/components/treino/treino-list"
import { Activity, ListChecks } from "lucide-react"

export default function TreinoPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8">
      <Tabs defaultValue="today" className="w-full">
        {/* Customizando o TabsList com as classes corretas do novo Shadcn/Base-UI */}
        <TabsList className="flex w-full h-auto bg-zinc-900 border border-zinc-800 rounded-xl mb-8 p-1.5">
          <TabsTrigger 
            value="today"
            className="flex-1 py-3 rounded-lg text-base font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-md text-zinc-400 hover:text-zinc-200"
          >
            <Activity className="w-5 h-5 mr-2 hidden sm:inline-block" />
            Treino de Hoje
          </TabsTrigger>
          <TabsTrigger 
            value="list"
            className="flex-1 py-3 rounded-lg text-base font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-md text-zinc-400 hover:text-zinc-200"
          >
            <ListChecks className="w-5 h-5 mr-2 hidden sm:inline-block" />
            Meus Treinos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-0 outline-none">
          <TreinoToday />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0 outline-none">
          <TreinoList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
