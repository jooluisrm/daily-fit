"use client"

import { cn } from "@/lib/utils"

export function WeekCalendar() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Encontrar o domingo da semana atual
  const startOfWeek = new Date(today)
  const currentDay = startOfWeek.getDay()
  startOfWeek.setDate(today.getDate() - currentDay)
  
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return {
      label: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()],
      date: d.getDate().toString(),
      isToday: d.getTime() === today.getTime(),
    }
  })

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Essa Semana</h2>
      </div>
      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex justify-between md:justify-start gap-2 min-w-max">
          {days.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl min-w-[3.5rem] transition-all",
                day.isToday 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 opacity-60"
              )}
            >
              <span className="text-xs font-medium mb-1 opacity-80">{day.label}</span>
              <span className={cn(
                "text-lg font-bold",
                day.isToday ? "" : "text-zinc-200"
              )}>
                {day.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
