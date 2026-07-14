import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const logs = await prisma.cardioLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Erro ao buscar histórico de cardio:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
