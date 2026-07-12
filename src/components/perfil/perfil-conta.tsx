"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, LogOut, User, Save } from "lucide-react"

export function PerfilConta() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
            <User className="w-10 h-10 text-zinc-500" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white border-2 border-black hover:bg-primary/90 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 space-y-1 text-center sm:text-left pt-2">
          <h3 className="text-lg font-semibold text-white">Foto de Perfil</h3>
          <p className="text-sm text-zinc-400">Adicione uma foto para personalizar seu perfil.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-zinc-300">Primeiro Nome</Label>
            <Input 
              id="firstName" 
              defaultValue="João"
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-zinc-300">Sobrenome</Label>
            <Input 
              id="lastName" 
              defaultValue="Silva"
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
          <Input 
            id="email" 
            type="email"
            defaultValue="joao.silva@exemplo.com"
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-zinc-300">Celular</Label>
          <Input 
            id="phone" 
            type="tel"
            defaultValue="(11) 99999-9999"
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
          />
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
          <Save className="w-5 h-5 mr-2" />
          Salvar Alterações
        </Button>
        <Button variant="outline" className="w-full h-12 text-base font-semibold text-red-400 border-red-900/30 bg-red-950/10 hover:bg-red-950/40 hover:text-red-300 hover:border-red-800 transition-colors">
          <LogOut className="w-5 h-5 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </div>
  )
}
