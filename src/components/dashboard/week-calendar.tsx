"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Encontrar o domingo da semana atual + offset
  const startOfWeek = new Date(today)
  const currentDay = startOfWeek.getDay()
  startOfWeek.setDate(today.getDate() - currentDay + (weekOffset * 7))
  
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return {
      label: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()],
      date: d.getDate().toString(),
      isToday: d.getTime() === today.getTime(),
      isSelected: d.getTime() === selectedDate.getTime(),
      fullDate: d
    }
  })

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Semana {weekOffset === 0 ? "Atual" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="w-8 h-8 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => setWeekOffset(prev => prev - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="h-8 text-xs font-medium bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => { setWeekOffset(0); onSelectDate(today); }} disabled={weekOffset === 0 && selectedDate.getTime() === today.getTime()}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => setWeekOffset(prev => prev + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex justify-between md:justify-start gap-2 min-w-max">
          {days.map((day, i) => (
            <button 
              key={i} 
              onClick={() => onSelectDate(day.fullDate)}
              className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-colors ${
                day.isSelected 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <span className="text-xs font-medium uppercase mb-1">{day.label}</span>
              <span className={`text-lg font-bold ${day.isSelected ? "text-primary-foreground" : "text-white"}`}>
                {day.date}
              </span>
              {day.isToday && !day.isSelected && (
                <div className="w-1 h-1 rounded-full bg-primary mt-1 absolute bottom-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
