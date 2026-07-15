import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { WorkoutLogService } from '@/src/backend/services/workout-log.service';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const url = new URL(req.url);
    const startIso = url.searchParams.get('start');
    const endIso = url.searchParams.get('end');
    
    const logs = await WorkoutLogService.getAllTodayWorkoutLogs(session.user.id, startIso, endIso);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Erro ao buscar todos os logs de hoje:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
