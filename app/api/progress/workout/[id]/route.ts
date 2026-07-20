import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutId = resolvedParams.id;

    // Busca o treino para ter o nome
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout || workout.userId !== session.user.id) {
      return NextResponse.json({ error: 'Treino não encontrado.' }, { status: 404 });
    }

    // Busca as sessões concluídas
    const logs = await prisma.workoutLog.findMany({
      where: {
        workoutId,
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: {
        exerciseLogs: true
      },
      orderBy: { date: 'asc' }
    });

    const sessions = logs.map(log => {
      const dateStr = log.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      let volume = 0;
      log.exerciseLogs.forEach(exLog => {
        volume += exLog.weight * exLog.repsDone;
      });

      let duration: number | null = null;
      if (log.startTime && log.endTime) {
        const diffMs = log.endTime.getTime() - log.startTime.getTime();
        duration = Math.round(diffMs / 60000); // converte para minutos
        if (duration < 0) duration = 0;
      }

      return {
        date: dateStr,
        volume,
        duration
      };
    });

    return NextResponse.json({
      workoutName: workout.name,
      sessions
    });
  } catch (error: any) {
    console.error('Erro ao buscar histórico do treino específico:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
