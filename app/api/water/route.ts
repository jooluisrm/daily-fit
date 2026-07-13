import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar logs de hoje
    const logs = await prisma.waterLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lte: endOfDay
        }
      }
    });

    // Calcular o total consumido hoje
    const totalConsumed = logs.reduce((acc, log) => acc + log.amount, 0);

    // Buscar a meta de água do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { waterGoal: true, waterQuickAdds: true }
    });

    let quickAdds = [250, 500];
    if (user?.waterQuickAdds) {
      try {
        quickAdds = JSON.parse(user.waterQuickAdds);
      } catch (e) {
        console.error("Erro ao fazer parse dos atalhos rápidos", e);
      }
    }

    return NextResponse.json({
      totalConsumed,
      goal: user?.waterGoal || 2000,
      quickAdds,
      logs // opcionalmente retornar os logs caso queira mostrar o histórico no futuro
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados de água:', error);
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

    const { amount } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 });
    }

    const newLog = await prisma.waterLog.create({
      data: {
        userId: session.user.id,
        amount,
        date: new Date()
      }
    });

    return NextResponse.json(newLog);
  } catch (error: any) {
    console.error('Erro ao registrar água:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
