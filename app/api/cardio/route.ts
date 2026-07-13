import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { CardioService } from '@/src/backend/services/cardio.service';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const cardioLog = await CardioService.getTodayCardio(session.user.id);
    return NextResponse.json(cardioLog || null);
  } catch (error: any) {
    console.error('Erro ao buscar cardio de hoje:', error);
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

    if (data.duration === undefined || !data.intensity) {
      return NextResponse.json({ error: 'Campos duration e intensity são obrigatórios.' }, { status: 400 });
    }

    const cardioLog = await CardioService.logCardio(session.user.id, {
      intensity: data.intensity,
      duration: Number(data.duration),
      workoutId: data.workoutId
    });

    return NextResponse.json(cardioLog || { message: 'Cardio removido com sucesso' });
  } catch (error: any) {
    console.error('Erro ao salvar cardio:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
