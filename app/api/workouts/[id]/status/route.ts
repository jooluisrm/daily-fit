import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { WorkoutLogService } from '@/src/backend/services/workout-log.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutId = resolvedParams.id;
    const url = new URL(req.url);
    const startIso = url.searchParams.get('start');
    const endIso = url.searchParams.get('end');
    
    const workoutLog = await WorkoutLogService.getTodayWorkoutLog(session.user.id, workoutId, startIso, endIso);

    return NextResponse.json(workoutLog || null);
  } catch (error: any) {
    console.error('Erro ao buscar status do treino de hoje:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutId = resolvedParams.id;
    const data = await req.json();

    if (data.action === 'start') {
      const workoutLog = await WorkoutLogService.startWorkout(session.user.id, workoutId);
      return NextResponse.json(workoutLog);
    }

    if (data.action === 'update_status') {
      const workoutLog = await WorkoutLogService.updateWorkoutStatus(session.user.id, workoutId, data.status, data.hasCardio);
      return NextResponse.json(workoutLog);
    }

    if (data.isCompleted !== undefined) {
      const workoutLog = await WorkoutLogService.toggleWorkoutLog(session.user.id, workoutId, data.isCompleted);
      return NextResponse.json(workoutLog || { message: 'Treino reaberto com sucesso' });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro ao processar status do treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
