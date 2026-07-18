"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, Activity } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useCardioLogs } from "@/src/hooks/use-cardio"
import { format, parseISO } from "date-fns"

export function CardioChart() {
  const { data: logs } = useCardioLogs()
  
  const [showLeve, setShowLeve] = useState(true)
  const [showModerado, setShowModerado] = useState(true)
  const [showIntenso, setShowIntenso] = useState(true)

  const chartData = useMemo(() => {
    if (!logs) return []

    // Agrupar por data e somar as durações de cada intensidade por dia
    const grouped = logs.reduce((acc: any, log) => {
      const dateStr = log.date.split('T')[0] // Consideramos apenas a data ISO (YYYY-MM-DD)
      if (!acc[dateStr]) {
        acc[dateStr] = { dateStr, leve: 0, moderado: 0, intenso: 0 }
      }
      
      if (log.intensity === 'leve') acc[dateStr].leve += log.duration
      if (log.intensity === 'moderado') acc[dateStr].moderado += log.duration
      if (log.intensity === 'intenso') acc[dateStr].intenso += log.duration

      return acc
    }, {})

    // Converter para array e ordenar pela data
    return Object.values(grouped).sort((a: any, b: any) => a.dateStr.localeCompare(b.dateStr)).map((d: any) => ({
      ...d,
      displayDate: format(parseISO(d.dateStr), 'dd/MM')
    }))
  }, [logs])

  // Calcular max duration para o YAxis
  const maxDuration = chartData.reduce((max: number, curr: any) => {
    const vals = []
    if (showLeve) vals.push(curr.leve)
    if (showModerado) vals.push(curr.moderado)
    if (showIntenso) vals.push(curr.intenso)
    const localMax = Math.max(0, ...vals)
    return localMax > max ? localMax : max
  }, 0)
  
  const yAxisMax = Math.ceil((maxDuration || 30) / 10) * 10 // Arredonda pro próximo 10

  const totalMinutosGerais = logs ? logs.reduce((acc, log) => acc + log.duration, 0) : 0

  return (
    <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border-zinc-800/50 h-full flex flex-col relative overflow-hidden group hover:border-zinc-700/50 transition-all shadow-sm">
      <div className="absolute -left-12 -top-12 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Evolução de Cardio
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs mt-1">
              Total Acumulado: <span className="text-white font-medium">{totalMinutosGerais} min</span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <Checkbox 
                checked={showLeve} 
                onCheckedChange={(c) => setShowLeve(c as boolean)} 
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 w-3.5 h-3.5 border-zinc-600 rounded-sm"
              />
              Leve
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <Checkbox 
                checked={showModerado} 
                onCheckedChange={(c) => setShowModerado(c as boolean)} 
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 w-3.5 h-3.5 border-zinc-600 rounded-sm"
              />
              Moderado
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <Checkbox 
                checked={showIntenso} 
                onCheckedChange={(c) => setShowIntenso(c as boolean)} 
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 w-3.5 h-3.5 border-zinc-600 rounded-sm"
              />
              Intenso
            </label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1 min-h-[250px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis 
                domain={[0, yAxisMax]}
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}m`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => {
                  const labelMap: any = { leve: "Leve", moderado: "Moderado", intenso: "Intenso" }
                  return [`${value} min`, labelMap[name] || name]
                }}
              />
              
              {showLeve && (
                <Line 
                  type="monotone" 
                  dataKey="leve" 
                  name="leve"
                  stroke="#10b981" // emerald-500
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                />
              )}
              {showModerado && (
                <Line 
                  type="monotone" 
                  dataKey="moderado" 
                  name="moderado"
                  stroke="#3b82f6" // blue-500
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                />
              )}
              {showIntenso && (
                <Line 
                  type="monotone" 
                  dataKey="intenso" 
                  name="intenso"
                  stroke="#f97316" // orange-500
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
            <Activity className="w-8 h-8 mb-2 opacity-20" />
            <p>Nenhum cardio registrado ainda.</p>
            <p>Comece a registrar seus treinos aeróbicos!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
