import React, { forwardRef } from 'react';
import { Dumbbell, Timer, Activity, CalendarDays, Flame, CheckCircle2 } from 'lucide-react';

export interface ShareWorkoutCardProps {
  workoutName: string;
  date: string;
  durationMins: number;
  totalVolume: number;
  exercisesCount: number;
  userName?: string;
  topExercises?: { name: string; volume: number; sets: number }[];
  cardioDurationMins?: number;
  theme?: 'dark' | 'primary' | 'emerald';
}

export const ShareWorkoutCard = forwardRef<HTMLDivElement, ShareWorkoutCardProps>(
  ({ workoutName, date, durationMins, totalVolume, exercisesCount, userName, topExercises = [], theme = 'dark' }, ref) => {

    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h > 0) return `${h}h ${m}m`;
      return `${m} min`;
    };

    return (
      <div
        ref={ref}
        // Fixed dimensions for the export
        className="w-[800px] h-[1250px] relative bg-zinc-950 overflow-hidden flex flex-col font-sans"
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          boxSizing: "border-box"
        }}
      >
        {/* Background Effects */}
        {theme === 'dark' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black opacity-80" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
          </>
        )}
        {theme === 'primary' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-zinc-950 to-black opacity-90" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
          </>
        )}
        {theme === 'emerald' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-zinc-950 to-black opacity-90" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-700/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
          </>
        )}

        {/* Grid Pattern overlay (optional) */}
        <div className="absolute inset-0 bg-zinc-950 opacity-10 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col h-full p-16 flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-black text-white tracking-tight">DAILY FIT</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-6 py-3 rounded-full backdrop-blur-md">
              <CalendarDays className="w-6 h-6 text-zinc-400" />
              <span className="text-zinc-200 font-bold text-xl">{date}</span>
            </div>
          </div>

          {/* Main Title Area */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-xl text-base font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-5 h-5" />
              Treino Concluído
            </div>
            <h1 className="text-7xl font-black text-white tracking-tighter leading-tight mb-4 drop-shadow-md">
              {workoutName}
            </h1>
            {userName && (
              <p className="text-2xl text-zinc-400 font-medium">
                Concluído por <span className="text-white font-bold">{userName}</span>
              </p>
            )}
          </div>

          {/* Big Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {/* Stat: Time */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Tempo Total</span>
              </div>
              <div className="text-5xl font-black text-white tracking-tight">
                {formatTime(durationMins)}
              </div>
            </div>

            {/* Stat: Volume */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <Flame className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Volume Movid.</span>
              </div>
              <div className="text-5xl font-black text-white tracking-tight">
                {totalVolume}<span className="text-2xl text-zinc-500 ml-1">kg</span>
              </div>
            </div>

            {/* Stat: Exercises */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Exercícios</span>
              </div>
              <div className="text-5xl font-black text-white tracking-tight">
                {exercisesCount}
              </div>
            </div>
          </div>

          {/* Top Exercises List (if any) */}
          {topExercises.length > 0 && (
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-zinc-300 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                Destaques do Treino
              </h3>
              <div className="space-y-4">
                {topExercises.slice(0, 4).map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between py-5 border-b border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-600 font-bold text-2xl w-8">{idx + 1}.</span>
                      <span className="text-white font-bold text-2xl">{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-zinc-400 font-semibold text-xl">{ex.sets} séries</span>
                      <span className="bg-zinc-800 text-zinc-200 px-5 py-2 rounded-xl font-bold text-xl">
                        {ex.volume} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer branding */}
          <div className="mt-12 pt-8 border-t border-zinc-800/50 flex justify-between items-end">
            <div>
              <p className="text-zinc-500 font-semibold text-xl">Supere seus limites hoje.</p>
              <p className="text-primary font-bold text-2xl mt-1">@dailyfitapp</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-2xl border-[3px] border-zinc-800 flex items-center justify-center bg-zinc-900">
                <Dumbbell className="w-8 h-8 text-zinc-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareWorkoutCard.displayName = 'ShareWorkoutCard';
