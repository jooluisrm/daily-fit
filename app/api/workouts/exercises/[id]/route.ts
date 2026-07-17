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
    const workoutExerciseId = resolvedParams.id;
    const data = await req.json();

    const updated = await ExerciseService.updateWorkoutExercise(workoutExerciseId, session.user.id, {
      name: data.name,
      imageUrl: data.imageUrl,
      sets: data.sets ? Number(data.sets) : undefined,
      reps: data.reps,
      isActive: data.isActive
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar exercício do treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutExerciseId = resolvedParams.id;

    await ExerciseService.deleteWorkoutExercise(workoutExerciseId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir exercício do treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
