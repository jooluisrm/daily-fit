import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { WorkoutLogService } from '@/src/backend/services/workout-log.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const historyDetail = await WorkoutLogService.getHistoryDetail(session.user.id, id);
    
    if (!historyDetail) {
      return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(historyDetail);
  } catch (error: any) {
    console.error('Erro ao buscar detalhes do treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
