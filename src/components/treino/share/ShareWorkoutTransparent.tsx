import React, { forwardRef } from 'react';
import { ShareWorkoutCardProps } from './ShareWorkoutCard';

export const ShareWorkoutTransparent = forwardRef<HTMLDivElement, ShareWorkoutCardProps>(
  ({ workoutName, durationMins, totalVolume, cardioDurationMins }, ref) => {
    
    const formatTime = (mins: number) => {
      if (!mins) return '0 min';
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h > 0) return `${h}h ${m}min`;
      return `${m}min`;
    };

    return (
      <div 
        ref={ref}
        // Fixed dimensions for the export
        className="w-[800px] h-[1250px] relative bg-transparent flex flex-col items-center justify-center font-sans p-16"
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          boxSizing: "border-box"
        }}
      >
        <div className="flex flex-col items-center justify-center gap-16 w-full max-w-2xl text-center h-full px-8">
          {/* Nome do treino */}
          <div className="flex flex-col items-center gap-4 w-full">
            <span className="text-3xl font-bold text-white/80 uppercase tracking-widest drop-shadow-md">Treino</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-lg">
              {workoutName}
            </h1>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-2xl font-bold text-white/80 uppercase tracking-widest drop-shadow-md">Volume Total</span>
            <div className="text-6xl font-black text-white drop-shadow-lg">
              {totalVolume} <span className="text-4xl">kg</span>
            </div>
          </div>

          {/* Cardio (opcional) */}
          {cardioDurationMins && cardioDurationMins > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <span className="text-2xl font-bold text-white/80 uppercase tracking-widest drop-shadow-md">Cardio</span>
              <div className="text-6xl font-black text-white drop-shadow-lg">
                {formatTime(cardioDurationMins)}
              </div>
            </div>
          ) : null}

          {/* Tempo total */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-2xl font-bold text-white/80 uppercase tracking-widest drop-shadow-md">Tempo Total</span>
            <div className="text-6xl font-black text-white drop-shadow-lg">
              {formatTime(durationMins)}
            </div>
          </div>

          {/* Branding Logo */}
          <div className="flex flex-col items-center mt-8">
            <span className="text-5xl font-black text-white tracking-widest uppercase drop-shadow-lg">
              DAILY FIT
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ShareWorkoutTransparent.displayName = 'ShareWorkoutTransparent';
