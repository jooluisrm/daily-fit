import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, LogOut, User, Save, Loader2, Trash2 } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useUpdateProfile, useUploadAvatar, useRemoveAvatar } from "@/src/hooks/use-user"
import { toast } from "sonner"

export function PerfilConta() {
  const { data: session, update } = useSession()
  const user = session?.user as any

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  const { mutateAsync: uploadAvatar, isPending: isUploading } = useUploadAvatar()
  const { mutateAsync: removeAvatar, isPending: isRemoving } = useRemoveAvatar()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // States para os inputs
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [localImage, setLocalImage] = useState<string | null>(null)

  // Sincroniza estado com a sessão quando carregar
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      if (user.image) {
        setLocalImage(user.image)
      } else {
        setLocalImage(null)
      }
    }
  }, [user])

  const isFirstNameMissing = !user?.firstName;
  const isLastNameMissing = !user?.lastName;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("O primeiro nome e o sobrenome são obrigatórios.");
      return;
    }

    try {
      await updateProfile({
        firstName,
        lastName
      })

      // Atualiza o JWT do NextAuth em memória
      await update({
        firstName,
        lastName,
        isProfileComplete: !!(firstName && user?.age && user?.height && user?.weight && user?.gender)
      })

      toast.success("Dados da conta salvos com sucesso!")
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar os dados.")
      console.error(error)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadAvatar(file)
      if (result.success && result.imageUrl) {
        setLocalImage(result.imageUrl)

        // Atualiza o token do NextAuth em tempo real para refletir a foto na sidebar
        await update({
          image: result.imageUrl
        })

        toast.success("Foto atualizada com sucesso!")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao atualizar foto de perfil.")
    }
  }

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique acione o seletor de arquivos do círculo maior
    try {
      await removeAvatar()
      setLocalImage(null)

      await update({
        image: null
      })

      toast.success("Foto removida com sucesso!")

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao remover foto de perfil.")
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isSaveDisabled = 
    isPending || 
    !firstName.trim() || 
    !lastName.trim() || 
    (firstName === (user?.firstName || "") && lastName === (user?.lastName || ""));

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20">
            {localImage ? (
              <img src={localImage} alt="Profile Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <User className="w-10 h-10 text-zinc-500 transition-colors group-hover:text-primary/70" />
            )}
            {/* Overlay sutil ao passar o mouse */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="w-6 h-6 text-white/80" />
            </div>
          </div>

          {/* Botão Flutuante (Lixeira se tiver foto, Câmera se não tiver) */}
          <button
            disabled={isUploading || isRemoving}
            onClick={localImage ? handleRemoveAvatar : (e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-black transition-all hover:scale-110 hover:shadow-lg disabled:opacity-50 ${localImage
                ? "bg-red-500 hover:bg-red-600 hover:shadow-red-500/30"
                : "bg-primary hover:bg-primary/90 hover:shadow-primary/30"
              }`}
          >
            {isUploading || isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : localImage ? (
              <Trash2 className="w-4 h-4 cursor-pointer" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="flex-1 space-y-1 text-center sm:text-left pt-2">
          <h3 className="text-lg font-semibold text-white">Foto de Perfil</h3>
          <p className="text-sm text-zinc-400">Adicione uma foto para personalizar seu perfil.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className={isFirstNameMissing ? "text-red-400" : "text-zinc-300"}>Primeiro Nome *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Digite seu nome"
              className={`bg-zinc-900 text-white focus-visible:ring-primary h-12 ${isFirstNameMissing ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-800"}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className={isLastNameMissing ? "text-red-400" : "text-zinc-300"}>Sobrenome *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Digite seu sobrenome"
              className={`bg-zinc-900 text-white focus-visible:ring-primary h-12 ${isLastNameMissing ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-800"}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12 opacity-70 cursor-not-allowed"
          />
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="phone" className="text-zinc-300">Celular</Label>
          <Input 
            id="phone" 
            type="tel"
            defaultValue=""
            placeholder="(00) 00000-0000"
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary h-12"
          />
        </div> */}
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Alterações
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-base font-semibold text-red-400 border-red-900/30 bg-red-950/10 hover:bg-red-950/40 hover:text-red-300 hover:border-red-800 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </div>
  )
}
