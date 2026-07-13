import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { WorkoutService } from '@/src/backend/services/workout.service';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const workouts = await WorkoutService.getWorkouts(session.user.id);

    // Formatar daysOfWeek de volta para array
    const formattedWorkouts = workouts.map(workout => ({
      ...workout,
      daysOfWeek: JSON.parse(workout.daysOfWeek)
    }));

    return NextResponse.json(formattedWorkouts);
  } catch (error: any) {
    console.error('Erro ao buscar treinos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const data = await req.json();

    const workout = await WorkoutService.createWorkout(session.user.id, data);

    return NextResponse.json({
      ...workout,
      daysOfWeek: JSON.parse(workout.daysOfWeek)
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
