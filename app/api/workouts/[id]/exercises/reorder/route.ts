import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { ExerciseService } from '@/src/backend/services/exercise.service';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutId = resolvedParams.id;
    const { orderedExerciseIds } = await req.json();

    if (!Array.isArray(orderedExerciseIds)) {
      return NextResponse.json({ error: 'Formato inválido. Esperado um array de IDs.' }, { status: 400 });
    }

    await ExerciseService.reorderWorkoutExercises(workoutId, session.user.id, orderedExerciseIds);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao reordenar exercícios:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
