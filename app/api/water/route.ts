import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const now = new Date();
    const spDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    
    // Início do dia no Brasil
    const today = new Date(`${spDateStr}T00:00:00.000-03:00`);
    
    // Fim do dia no Brasil
    const endOfDay = new Date(`${spDateStr}T23:59:59.999-03:00`);

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

    // Buscar dados do usuário para o cálculo inteligente
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { waterGoal: true, waterQuickAdds: true, weight: true, age: true }
    });

    const latestWeightLog = await prisma.weightLog.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' }
    });

    // --- CÁLCULO INTELIGENTE DA META DE ÁGUA ---
    let dynamicGoal = user?.waterGoal || 2000;
    const currentWeight = latestWeightLog?.weight || user?.weight;
    
    if (currentWeight) {
      const age = user?.age || 30;
      let multiplier = 35;
      if (age < 18) multiplier = 40;
      else if (age >= 55 && age <= 65) multiplier = 30;
      else if (age > 65) multiplier = 25;

      const baseGoal = currentWeight * multiplier;

      // Buscar cardio e treinos de hoje
      const cardioLogs = await prisma.cardioLog.findMany({
        where: { userId: session.user.id, date: { gte: today, lte: endOfDay } }
      });
      const totalCardioMinutes = cardioLogs.reduce((acc, log) => acc + log.duration, 0);

      const workoutLogs = await prisma.workoutLog.findMany({
        where: { userId: session.user.id, date: { gte: today, lte: endOfDay } }
      });
      const totalWorkoutMinutes = workoutLogs.length * 60; // Assume 60 min por treino
      const totalActiveMinutes = totalCardioMinutes + totalWorkoutMinutes;
      
      const extraGoal = (totalActiveMinutes / 60) * 500;
      dynamicGoal = Math.round((baseGoal + extraGoal) / 100) * 100;
    }
    // -------------------------------------------

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
      goal: dynamicGoal,
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
