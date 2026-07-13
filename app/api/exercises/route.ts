import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { ExerciseService } from '@/src/backend/services/exercise.service';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const exercises = await ExerciseService.getAllExercises();

    return NextResponse.json(exercises);
  } catch (error: any) {
    console.error('Erro ao buscar exercícios:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
