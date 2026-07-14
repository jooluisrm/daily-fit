"use client"

import { useState, useEffect } from "react"
import { Timer, Play, Pause, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RestTimerProps {
  initialSeconds: number
  onClose: () => void
}

export function RestTimer({ initialSeconds, onClose }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
    setIsActive(true)
  }, [initialSeconds])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (secondsLeft <= 0) {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, secondsLeft])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAdjust = (amount: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + amount))
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-zinc-900 border border-zinc-800 shadow-xl rounded-full px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${secondsLeft === 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/20 text-primary'}`}>
            <Timer className="w-4 h-4" />
          </div>
          <span className={`text-xl font-bold font-mono w-16 text-center ${secondsLeft === 0 ? 'text-emerald-500' : 'text-white'}`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
        
        <div className="h-6 w-px bg-zinc-800 mx-1"></div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full text-zinc-400 hover:text-white"
            onClick={() => handleAdjust(-30)}
          >
            <span className="text-xs font-bold">-30s</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 rounded-full text-white bg-zinc-800 hover:bg-zinc-700 hover:text-white"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full text-zinc-400 hover:text-white"
            onClick={() => handleAdjust(30)}
          >
            <span className="text-xs font-bold">+30s</span>
          </Button>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1"></div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
