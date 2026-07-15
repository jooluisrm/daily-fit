import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Dumbbell, ChevronRight, Calendar, Loader2, History, Timer } from "lucide-react"
import { useWorkouts } from "@/src/hooks/use-workout"

const DAYS_MAP = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

export function TreinoList() {
  const { data: workouts, isLoading } = useWorkouts()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Meus Treinos</h1>
          <p className="text-zinc-400 text-sm">Gerencie suas rotinas de exercícios criadas</p>
        </div>
        <Link href="/treino/novo" className="w-full sm:w-auto">
          <Button className="w-full h-11 px-6 text-base font-medium shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Novo Treino
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : !workouts || workouts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-4">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum treino encontrado</h3>
          <p className="text-zinc-400 max-w-sm mb-6">
            Você ainda não tem nenhuma rotina cadastrada. Crie seu primeiro treino para começar.
          </p>
          <Link href="/treino/novo">
            <Button className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium">
              Criar Meu Primeiro Treino
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workouts.map((workout) => (
            <Link key={workout.id} href={`/treino/${workout.id}`} className="group block">
              <Card className="bg-zinc-900 border-zinc-800 group-hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">{workout.name}</h3>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-800/50 flex flex-col gap-2.5">
                    <div className="flex items-center text-[11px] text-zinc-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                      {workout.daysOfWeek.length > 0 
                        ? workout.daysOfWeek.sort().map(d => DAYS_MAP[d]).join(", ")
                        : "Nenhum dia selecionado"}
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                      {(() => {
                        const logs = workout.workoutLogs || [];
                        if (logs.length === 0) {
                          return (
                            <>
                              <div className="flex items-center gap-1.5"><History className="w-3.5 h-3.5 opacity-70" /> Faça seu primeiro treino</div>
                              <div className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 opacity-70" /> ~ 0m</div>
                            </>
                          )
                        }

                        // Calculate days ago
                        const lastLogDate = new Date(logs[0].date);
                        lastLogDate.setHours(0,0,0,0);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const diffTime = Math.abs(today.getTime() - lastLogDate.getTime());
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        let daysText = "Hoje";
                        if (diffDays === 1) daysText = "Ontem";
                        else if (diffDays > 1) daysText = `Há ${diffDays} dias`;

                        // Calculate average time
                        let totalMins = 0;
                        let count = 0;
                        logs.forEach(log => {
                          if (log.startTime && log.endTime) {
                            const diff = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
                            totalMins += Math.round(diff / 60000);
                            count++;
                          }
                        });
                        const avgTime = count > 0 ? Math.round(totalMins / count) : 0;

                        return (
                          <>
                            <div className="flex items-center gap-1.5"><History className="w-3.5 h-3.5 opacity-70" /> {daysText}</div>
                            <div className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 opacity-70" /> ~ {avgTime}m</div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
