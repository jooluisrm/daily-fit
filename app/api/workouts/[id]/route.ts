import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { WorkoutService } from '@/src/backend/services/workout.service';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workoutId = resolvedParams.id;
    const data = await req.json();

    const updatedWorkout = await WorkoutService.updateWorkout(workoutId, session.user.id, {
      name: data.name,
      daysOfWeek: data.daysOfWeek,
      isActive: data.isActive
    });

    return NextResponse.json({
      ...updatedWorkout,
      daysOfWeek: JSON.parse(updatedWorkout.daysOfWeek)
    });
  } catch (error: any) {
    console.error('Erro ao atualizar treino:', error);
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
    const workoutId = resolvedParams.id;

    await WorkoutService.deleteWorkout(workoutId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
