import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SwipeIndicatorProps {
  isSwipeLocked: boolean
  setIsSwipeLocked: (locked: boolean) => void
  shakeLock: boolean
  onNext: () => void
  onPrev: () => void
  hasNext: boolean
}

export function SwipeIndicator({
  isSwipeLocked,
  setIsSwipeLocked,
  shakeLock,
  onNext,
  onPrev,
  hasNext
}: SwipeIndicatorProps) {
  return (
    <div className="mt-auto flex justify-center items-center gap-8 pb-8">
      <div className="w-12 h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isSwipeLocked ? (
            <motion.div
              key="btn-prev"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-full w-12 h-12 hover:bg-zinc-800 transition-colors">
                <ChevronLeft className="w-8 h-8 text-zinc-400" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="anim-prev"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center opacity-50 w-full h-full"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
              <ChevronLeft className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "200ms", marginLeft: "-12px" }} />
              <ChevronLeft className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "400ms", marginLeft: "-12px" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes shakeLock {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px) rotate(-4deg); }
          40% { transform: translateX(4px) rotate(4deg); }
          60% { transform: translateX(-4px) rotate(-4deg); }
          80% { transform: translateX(4px) rotate(4deg); }
        }
      `}</style>

      <Button
        variant="secondary"
        onClick={() => setIsSwipeLocked(!isSwipeLocked)}
        className={cn(
          "rounded-full w-14 h-14 border-2 flex items-center justify-center transition-all shadow-lg shrink-0",
          isSwipeLocked
            ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
            : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20",
          shakeLock ? "animate-[shakeLock_0.4s_ease-in-out]" : ""
        )}
      >
        <AnimatePresence mode="wait">
          {isSwipeLocked ? (
            <motion.div key="lock" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
              <Lock className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="unlock" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
              <Unlock className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <div className="w-12 h-12 flex items-center justify-center">
        {hasNext && (
          <AnimatePresence mode="wait">
            {isSwipeLocked ? (
              <motion.div
                key="btn-next"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="ghost" size="icon" onClick={onNext} className="rounded-full w-12 h-12 hover:bg-zinc-800 transition-colors">
                  <ChevronRight className="w-8 h-8 text-zinc-400" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="anim-next"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center opacity-50 w-full h-full"
              >
                <ChevronRight className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "400ms", marginRight: "-12px" }} />
                <ChevronRight className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "200ms", marginRight: "-12px" }} />
                <ChevronRight className="w-6 h-6 text-zinc-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
