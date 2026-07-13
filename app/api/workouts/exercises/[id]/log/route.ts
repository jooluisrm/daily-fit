import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { ExerciseService } from '@/src/backend/services/exercise.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutExerciseId = resolvedParams.id;
    const data = await req.json();

    if (data.weight === undefined || data.repsDone === undefined || data.setNumber === undefined) {
      return NextResponse.json({ error: 'Campos weight, repsDone e setNumber são obrigatórios.' }, { status: 400 });
    }

    const log = await ExerciseService.logExercise(workoutExerciseId, session.user.id, {
      setNumber: Number(data.setNumber),
      weight: Number(data.weight),
      repsDone: Number(data.repsDone)
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao logar exercício:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
