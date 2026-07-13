import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const logs = await prisma.weightLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Erro ao buscar histórico de peso:', error);
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

    const { weight, date } = await req.json();

    if (!weight || typeof weight !== 'number') {
      return NextResponse.json({ error: 'Peso inválido' }, { status: 400 });
    }

    // Se vier uma data, usamos ela, senão usamos hoje
    const targetDate = date ? new Date(date) : new Date();
    
    // Zera a hora para não ter múltiplos registros no mesmo dia facilmente
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Verifica se já existe um registro para o mesmo dia
    const existingLog = await prisma.weightLog.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: targetDate,
          lte: endOfDay
        }
      }
    });

    let newLog;
    if (existingLog) {
      // Atualiza o existente do mesmo dia
      newLog = await prisma.weightLog.update({
        where: { id: existingLog.id },
        data: { weight }
      });
    } else {
      // Cria um novo
      newLog = await prisma.weightLog.create({
        data: {
          userId: session.user.id,
          weight,
          date: targetDate
        }
      });
    }

    // Atualiza o peso atual do usuário também
    await prisma.user.update({
      where: { id: session.user.id },
      data: { weight }
    });

    return NextResponse.json(newLog);
  } catch (error: any) {
    console.error('Erro ao registrar peso:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
