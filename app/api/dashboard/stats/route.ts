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
    const days = 7; // Fixar em 7 dias para a semana

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days + 1);
    targetDate.setHours(0, 0, 0, 0);

    // 1. Frequência de Treinos (WorkoutLogs)
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: {
          gte: targetDate
        }
      },
      select: {
        date: true
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
        repsDone: true
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

    // Processar Totais
    const totalWorkouts = workoutLogs.length;
    const totalVolume = exerciseLogs.reduce((acc, log) => acc + (log.weight * log.repsDone), 0);
    const totalCardioMinutes = cardioLogs.reduce((acc, log) => acc + log.duration, 0);

    // Processar Streak (Semana Atual - Domingo a Sábado)
    const streak = [];
    const logDates = new Set(workoutLogs.map(log => log.date.toISOString().split('T')[0]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Encontrar o Domingo dessa semana
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // getDay() retorna 0 para Domingo, 1 para Seg, etc.

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      const isFuture = d > today;
      const isTodayDate = d.getTime() === today.getTime();
      
      streak.push({
        date: dateStr,
        dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
        completed: logDates.has(dateStr),
        isToday: isTodayDate,
        isFuture
      });
    }

    return NextResponse.json({
      totalWorkouts,
      totalVolume,
      totalCardioMinutes,
      streak
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
