import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { WorkoutLogService } from '@/src/backend/services/workout-log.service';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const historyLogs = await WorkoutLogService.getHistory(session.user.id);
    return NextResponse.json(historyLogs);
  } catch (error: any) {
    console.error('Erro ao buscar histórico de treinos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
