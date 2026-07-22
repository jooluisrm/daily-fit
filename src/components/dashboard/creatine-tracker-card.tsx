"use client"

import { Button } from "@/components/ui/button"
import { Check, FlaskConical, Undo2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCreatineStatus, useTakeCreatine, useRemoveCreatine } from "@/src/hooks/use-creatine"
import { Skeleton } from "@/components/ui/skeleton"

export function CreatineTrackerCard() {
  const { data, isLoading } = useCreatineStatus();
  const takeCreatine = useTakeCreatine();
  const removeCreatine = useRemoveCreatine();

  const tookToday = data?.tookToday ?? false;

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-2xl bg-zinc-900/50" />
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <FlaskConical className="w-5 h-5 text-purple-500" />
        <h3 className="font-bold text-white text-lg">Creatina</h3>
      </div>

      <AnimatePresence mode="wait">
        {!tookToday ? (
          <motion.div
            key="not-taken"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-2 relative z-10"
          >
            <Button
              onClick={() => takeCreatine.mutate()}
              disabled={takeCreatine.isPending}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-purple-500/50 h-12 rounded-xl transition-all font-semibold"
            >
              {takeCreatine.isPending ? "Registrando..." : "Tomar Creatina (Hoje)"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="taken"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-3 relative z-10"
          >
            <div className="flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-green-500 font-medium">Creatina Tomada!</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCreatine.mutate()}
              disabled={removeCreatine.isPending}
              className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 w-full"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Desfazer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative background glow */}
      {tookToday && (
        <div className="absolute inset-0 bg-green-500/5 blur-3xl pointer-events-none transition-opacity duration-1000" />
      )}
      {!tookToday && (
        <div className="absolute inset-0 bg-purple-500/5 blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
    </div>
  )
}
