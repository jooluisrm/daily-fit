"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

interface StreakDay {
  date: string;
  dayName: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function WeeklyStreak({ streak }: { streak: StreakDay[] }) {
  if (!streak || streak.length === 0) return null

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-white">Sequência da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center gap-2">
          {streak.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  day.completed 
                    ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" 
                    : day.isFuture
                      ? "bg-transparent border border-dashed border-zinc-800 text-zinc-800"
                      : "bg-zinc-800 text-zinc-600"
                } ${day.isToday && !day.completed ? "ring-1 ring-zinc-700 bg-zinc-800 text-zinc-400" : ""}`}
              >
                {day.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className={`w-4 h-4 ${day.isFuture ? "opacity-0" : ""}`} />
                )}
              </div>
              <span className={`text-xs font-medium ${day.isToday ? "text-white" : day.isFuture ? "text-zinc-700" : "text-zinc-500"}`}>
                {day.dayName}
              </span>
              {day.isToday && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
