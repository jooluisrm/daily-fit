import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';
    const tz = searchParams.get('tz') || 'America/Sao_Paulo';

    const now = new Date();
    let startDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '1y') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const logs = await prisma.workoutLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: now,
        },
        status: { in: ['COMPLETED', 'CARDIO', 'IN_PROGRESS'] } // Ideally only COMPLETED, but leaving IN_PROGRESS for testing
      },
      include: {
        exerciseLogs: true,
      },
      orderBy: { date: 'asc' }
    });

    // Grouping
    const groupedData: Record<string, { volume: number, treinos: number }> = {};

    logs.forEach(log => {
      let key = "";
      const dateParts = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', year: '2-digit' }).formatToParts(log.date);
      const day = dateParts.find(p => p.type === 'day')?.value;
      const month = dateParts.find(p => p.type === 'month')?.value;
      const year = dateParts.find(p => p.type === 'year')?.value;

      if (range === '1y') {
        key = `${month}/${year}`;
      } else {
        key = `${day}/${month}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { volume: 0, treinos: 0 };
      }
      
      groupedData[key].treinos += 1;
      
      // Calculate volume for this workout
      let workoutVolume = 0;
      log.exerciseLogs.forEach(exLog => {
        workoutVolume += (exLog.weight * exLog.repsDone);
      });
      
      groupedData[key].volume += workoutVolume;
    });

    const result = Object.entries(groupedData).map(([date, data]) => ({
      date,
      ...data
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro no progresso de treino:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
