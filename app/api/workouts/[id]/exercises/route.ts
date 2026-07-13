import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { ExerciseService } from '@/src/backend/services/exercise.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutId = resolvedParams.id;
    const exercises = await ExerciseService.getWorkoutExercises(workoutId, session.user.id);

    return NextResponse.json(exercises);
  } catch (error: any) {
    console.error('Erro ao buscar exercícios do treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: error.message.includes('não encontrado') ? 404 : 500 }
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

    if (!data.name || !data.sets || !data.reps) {
      return NextResponse.json({ error: 'Campos nome, sets e reps são obrigatórios.' }, { status: 400 });
    }

    const workoutExercise = await ExerciseService.addExerciseToWorkout(workoutId, session.user.id, {
      name: data.name,
      imageUrl: data.image || null, // No front a gente manda image, mas no back chamamos imageUrl
      sets: Number(data.sets),
      reps: data.reps
    });

    return NextResponse.json(workoutExercise, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar exercício:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
