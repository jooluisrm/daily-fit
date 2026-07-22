import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

function getTodayInTz(tz: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function formatDateInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tz = searchParams.get('tz') || 'America/Sao_Paulo';

    // Get the most recent creatine log
    const lastLog = await prisma.creatineLog.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    });

    if (!lastLog) {
      return NextResponse.json({ tookToday: false });
    }

    const todayStr = getTodayInTz(tz);
    const logDateStr = formatDateInTz(lastLog.date, tz);

    return NextResponse.json({ tookToday: todayStr === logDateStr });
  } catch (error: any) {
    console.error('Erro ao buscar status de creatina:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tz = searchParams.get('tz') || 'America/Sao_Paulo';

    // Check if already took today to prevent duplicates
    const lastLog = await prisma.creatineLog.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    });

    if (lastLog) {
      const todayStr = getTodayInTz(tz);
      const logDateStr = formatDateInTz(lastLog.date, tz);
      
      if (todayStr === logDateStr) {
        return NextResponse.json({ success: true, message: 'Já registrado hoje' });
      }
    }

    await prisma.creatineLog.create({
      data: {
        userId: session.user.id,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao registrar creatina:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tz = searchParams.get('tz') || 'America/Sao_Paulo';

    // Find logs from today (in the given timezone) and delete them
    // We could fetch today's logs and then delete by ID
    const todayStr = getTodayInTz(tz);
    
    // We fetch a window of 48h to be safe and filter in JS
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    const recentLogs = await prisma.creatineLog.findMany({
      where: { 
        userId: session.user.id,
        date: { gte: twoDaysAgo }
      }
    });

    const logsToDelete = recentLogs.filter(log => formatDateInTz(log.date, tz) === todayStr);

    if (logsToDelete.length > 0) {
      await prisma.creatineLog.deleteMany({
        where: {
          id: { in: logsToDelete.map(l => l.id) }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover creatina:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
