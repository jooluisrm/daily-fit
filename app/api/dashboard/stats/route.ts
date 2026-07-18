import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Ajuste de Fuso Horário para o Brasil (UTC-3)
    // Na Vercel (servidor), o Date() nativo retorna o dia em UTC.
    const now = new Date();
    const spDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    
    // Força a data de "hoje" a ser exatamente 00:00:00 no fuso de Brasília
    const today = new Date(`${spDateStr}T00:00:00.000-03:00`);

    // Encontrar o Domingo da semana atual para que todas as estatísticas fiquem sincronizadas
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - today.getDay());

    // Domingo da semana passada
    const lastWeekTargetDate = new Date(targetDate);
    lastWeekTargetDate.setDate(targetDate.getDate() - 7);

    // 0. Treinos Ativos
    const activeWorkouts = await prisma.workout.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, daysOfWeek: true }
    });

    // 1. Frequência de Treinos (WorkoutLogs)
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: {
          gte: targetDate
        }
      },
      select: {
        date: true,
        status: true
      }
    });

    // 2. Volume de Carga (ExerciseLogs)
    const exerciseLogs = await prisma.exerciseLog.findMany({
      where: {
        workoutExercise: {
          workout: {
            userId
          }
        },
        date: {
          gte: targetDate
        }
      },
      select: {
        weight: true,
        repsDone: true,
        workoutExercise: {
          select: {
            workoutId: true
          }
        }
      }
    });

    // 3. Cardio (CardioLogs)
    const cardioLogs = await prisma.cardioLog.findMany({
      where: {
        userId,
        date: {
          gte: targetDate
        }
      },
      select: {
        duration: true
      }
    });

    // --- DADOS DA SEMANA PASSADA ---
    const lastWeekWorkoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: { gte: lastWeekTargetDate, lt: targetDate }
      },
      select: { date: true, status: true }
    });

    const lastWeekExerciseLogs = await prisma.exerciseLog.findMany({
      where: {
        workoutExercise: { workout: { userId } },
        date: { gte: lastWeekTargetDate, lt: targetDate }
      },
      select: {
        weight: true,
        repsDone: true,
        workoutExercise: { select: { workoutId: true } }
      }
    });

    const lastWeekCardioLogs = await prisma.cardioLog.findMany({
      where: {
        userId,
        date: { gte: lastWeekTargetDate, lt: targetDate }
      },
      select: { duration: true }
    });

    // Processar Totais Atuais
    const totalWorkouts = workoutLogs.length;
    const totalVolume = exerciseLogs.reduce((acc, log) => acc + (log.weight * log.repsDone), 0);
    const totalCardioMinutes = cardioLogs.reduce((acc, log) => acc + log.duration, 0);

    const volumeByWorkout: Record<string, number> = {};
    exerciseLogs.forEach(log => {
      const vol = log.weight * log.repsDone;
      const wId = log.workoutExercise.workoutId;
      volumeByWorkout[wId] = (volumeByWorkout[wId] || 0) + vol;
    });

    // Processar Totais da Semana Passada
    const lastWeekTotalWorkouts = lastWeekWorkoutLogs.length;
    const lastWeekTotalVolume = lastWeekExerciseLogs.reduce((acc, log) => acc + (log.weight * log.repsDone), 0);
    const lastWeekTotalCardioMinutes = lastWeekCardioLogs.reduce((acc, log) => acc + log.duration, 0);

    const lastWeekVolumeByWorkout: Record<string, number> = {};
    lastWeekExerciseLogs.forEach(log => {
      const vol = log.weight * log.repsDone;
      const wId = log.workoutExercise.workoutId;
      lastWeekVolumeByWorkout[wId] = (lastWeekVolumeByWorkout[wId] || 0) + vol;
    });

    // Processar Streak (Semana Atual - Domingo a Sábado)
    const streak = [];
    
    const logDates = new Map<string, string>();
    workoutLogs.forEach(log => {
      const brDate = new Date(log.date.getTime() - (3 * 60 * 60 * 1000)); // Aplica -03:00 manual
      const dateStr = brDate.toISOString().split('T')[0];
      // Priorizar COMPLETED se houver múltiplos logs no mesmo dia
      if (log.status === 'COMPLETED' || !logDates.has(dateStr)) {
        logDates.set(dateStr, log.status);
      }
    });

    // today já foi declarado no início do arquivo
    // Reutilizar o targetDate (Domingo) que já calculamos no início
    const sunday = new Date(targetDate);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      const isFuture = d > today;
      const isTodayDate = d.getTime() === today.getTime();
      const logStatus = logDates.get(dateStr);
      const completed = logStatus === 'COMPLETED';
      const inProgress = logStatus === 'IN_PROGRESS' || logStatus === 'CARDIO';
      
      const dayIndex = d.getDay();
      const isRestDay = !activeWorkouts.some(w => w.daysOfWeek.includes(String(dayIndex)));
      const missedWorkout = !isFuture && !completed && !inProgress && !isRestDay;
      
      streak.push({
        date: dateStr,
        dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
        completed,
        inProgress,
        isToday: isTodayDate,
        isFuture,
        isRestDay,
        missedWorkout
      });
    }

    return NextResponse.json({
      totalWorkouts,
      totalVolume,
      totalCardioMinutes,
      streak,
      volumeByWorkout,
      lastWeekTotalWorkouts,
      lastWeekTotalVolume,
      lastWeekTotalCardioMinutes,
      lastWeekVolumeByWorkout,
      activeWorkouts: activeWorkouts.map(w => ({ id: w.id, name: w.name }))
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
