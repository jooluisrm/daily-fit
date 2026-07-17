import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { sets, reps } = await req.json();

    if (!sets || !reps) {
      return NextResponse.json(
        { error: 'As séries e repetições são obrigatórias.' },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Treino não encontrado.' }, { status: 404 });
    }

    if (workout.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este treino.' },
        { status: 403 }
      );
    }

    await prisma.workoutExercise.updateMany({
      where: { workoutId: id },
      data: {
        sets: Number(sets),
        reps: String(reps),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exercícios atualizados com sucesso.',
    });
  } catch (error: any) {
    console.error('Erro na sincronização de exercícios do treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
