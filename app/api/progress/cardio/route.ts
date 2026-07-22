import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';
    const tz = searchParams.get('tz') || 'America/Sao_Paulo';

    const now = new Date();
    let startDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '1y') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const logs = await prisma.cardioLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: now,
        }
      },
      orderBy: { date: 'asc' }
    });

    // Grouping
    const groupedData: Record<string, { esteira: number, bike: number, escada: number }> = {};

    logs.forEach(log => {
      let key = "";
      const dateParts = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', year: '2-digit' }).formatToParts(log.date);
      const day = dateParts.find(p => p.type === 'day')?.value;
      const month = dateParts.find(p => p.type === 'month')?.value;
      const year = dateParts.find(p => p.type === 'year')?.value;

      if (range === '1y') {
        key = `${month}/${year}`;
      } else {
        key = `${day}/${month}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { esteira: 0, bike: 0, escada: 0 };
      }
      
      const typeLower = log.type.toLowerCase();
      if (typeLower.includes('esteira')) {
        groupedData[key].esteira += log.duration;
      } else if (typeLower.includes('bike') || typeLower.includes('bicicleta')) {
        groupedData[key].bike += log.duration;
      } else if (typeLower.includes('escada')) {
        groupedData[key].escada += log.duration;
      } else {
        // Fallback for unknown cardio, could add 'outros' in the future
        groupedData[key].esteira += log.duration; 
      }
    });

    const result = Object.entries(groupedData).map(([date, types]) => ({
      date,
      ...types
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro no progresso de cardio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
