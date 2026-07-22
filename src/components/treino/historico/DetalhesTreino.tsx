"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, Activity, Timer, Target, Flame, ActivitySquare } from "lucide-react";
import { useWorkoutHistoryDetail } from "@/src/hooks/use-workout-log";
import { Skeleton } from "@/components/ui/skeleton";

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export function DetalhesTreino({ workoutId }: { workoutId: string }) {
  const { data: detail, isLoading } = useWorkoutHistoryDetail(workoutId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[200px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />
        <Skeleton className="h-[24px] w-[200px] bg-zinc-800 mt-2" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[150px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />
          <Skeleton className="h-[150px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl">
        <p className="text-zinc-400">Treino não encontrado ou ocorreu um erro.</p>
      </div>
    );
  }

  const start = new Date(detail.startTime);
  const end = detail.endTime ? new Date(detail.endTime) : new Date();
  const weightliftingTimeMinutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000 / 60));
  
  const cardioDetails = detail.cardioLogs?.[0];
  const cardioTimeMinutes = cardioDetails?.duration || 0;
  const totalTimeMinutes = weightliftingTimeMinutes + (detail.hasCardio ? cardioTimeMinutes : 0);
  
  // Agrupar os logs de exercícios por exercício
  const groupedExercises: Record<string, any> = {};
  if (detail.exerciseLogs) {
    detail.exerciseLogs.forEach((log: any) => {
      const exerciseId = log.workoutExerciseId;
      if (!groupedExercises[exerciseId]) {
        groupedExercises[exerciseId] = {
          id: exerciseId,
          exerciseName: log.workoutExercise?.exercise?.name || "Desconhecido",
          weightType: log.workoutExercise?.weightType || "TOTAL",
          sets: []
        };
      }
      groupedExercises[exerciseId].sets.push({
        setNumber: log.setNumber,
        weight: log.weight,
        repsDone: log.repsDone,
      });
    });
  }
  const exercises = Object.values(groupedExercises);

  // Calcular o volume total do treino
  let totalWorkoutVolume = 0;
  exercises.forEach(ex => {
    ex.sets.forEach((set: any) => {
      totalWorkoutVolume += (set.weight * set.repsDone);
    });
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo do Treino */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
             <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(detail.date).toLocaleDateString('pt-BR')}</span>
             </div>
             
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-zinc-400" />
                  {detail.workout?.name || "Treino Concluído"}
               </h2>
               
               <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700 w-fit">
                 <span className="text-xs text-zinc-400 uppercase font-semibold">Volume Total:</span>
                 <span className="text-sm font-bold text-zinc-100">{totalWorkoutVolume} kg</span>
               </div>
             </div>
          </div>

          <div className="flex flex-wrap gap-3">
             <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-800">
                <Dumbbell className="w-4 h-4 text-zinc-400" />
                <div className="flex flex-col">
                   <span className="text-[10px] text-zinc-500 uppercase font-semibold leading-none mb-1">Musculação</span>
                   <span className="text-sm font-medium text-zinc-200 leading-none">{formatTime(weightliftingTimeMinutes)}</span>
                </div>
             </div>
             {detail.hasCardio && (
               <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-800">
                  <Activity className="w-4 h-4 text-red-400" />
                  <div className="flex flex-col">
                     <span className="text-[10px] text-zinc-500 uppercase font-semibold leading-none mb-1">Cardio</span>
                     <span className="text-sm font-medium text-zinc-200 leading-none">{formatTime(cardioTimeMinutes)}</span>
                  </div>
               </div>
             )}
             <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                <Timer className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                   <span className="text-[10px] text-primary/70 uppercase font-semibold leading-none mb-1">Total</span>
                   <span className="text-sm font-bold text-primary leading-none">{formatTime(totalTimeMinutes)}</span>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Secção de Cardio se houver */}
      {detail.hasCardio && cardioDetails && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mt-2">
            <ActivitySquare className="w-5 h-5 text-red-400" />
            Cardio Realizado
          </h3>
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/50">
                <div className="p-4 flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Tipo</span>
                  <span className="text-sm text-zinc-200 font-semibold">{cardioDetails.type}</span>
                </div>
                <div className="p-4 flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Intensidade
                  </span>
                  <span className="text-sm text-zinc-200 font-semibold capitalize">{cardioDetails.intensity || 'N/A'}</span>
                </div>
                <div className="p-4 flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Tempo Realizado
                  </span>
                  <span className="text-sm text-zinc-200 font-semibold">{formatTime(cardioDetails.duration)}</span>
                </div>
                <div className="p-4 flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Meta
                  </span>
                  <span className="text-sm text-zinc-200 font-semibold">{cardioDetails.targetDuration ? formatTime(cardioDetails.targetDuration) : 'Livre'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Exercícios Executados */}
      <h3 className="text-lg font-bold text-zinc-100 mt-2">Exercícios Executados</h3>
      
      {exercises.length === 0 && (
        <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl mt-2">
          <p className="text-zinc-400">Nenhum exercício registrado neste treino.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {exercises.map((exercise) => {
          const exerciseVolume = exercise.sets.reduce((acc: number, set: any) => acc + (set.weight * set.repsDone), 0);

          return (
            <Card key={exercise.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {exercise.imageUrl ? (
                    <div className="w-10 h-10 relative rounded-md overflow-hidden bg-zinc-800/50 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={exercise.imageUrl} alt={exercise.exerciseName} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-zinc-500" />
                    </div>
                  )}
                  <CardTitle className="text-base text-zinc-200 leading-tight">{exercise.exerciseName}</CardTitle>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Volume</span>
                  <span className="text-sm font-semibold text-zinc-300">{exerciseVolume} kg</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-4 py-2 w-1/3">Série</th>
                      <th className="px-4 py-2 text-center w-1/3">Reps</th>
                      <th className="px-4 py-2 text-center w-1/3">Peso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {exercise.sets.map((set: any) => {
                      const isPerSide = exercise.weightType === "PER_SIDE";
                      const displayWeight = isPerSide ? (set.weight / 2) : set.weight;
                      const weightLabel = isPerSide ? `${displayWeight} kg c/ lado` : `${displayWeight} kg`;

                      return (
                        <tr key={set.setNumber} className="hover:bg-zinc-800/30">
                          <td className="px-4 py-3 text-zinc-300 font-medium">Série {set.setNumber}</td>
                          <td className="px-4 py-3 text-center text-zinc-300">{set.repsDone}</td>
                          <td className="px-4 py-3 text-center text-zinc-300">
                            {weightLabel}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
