import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import prisma from '@/src/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { goal, quickAdds } = await req.json();

    if (!goal || typeof goal !== 'number' || goal < 500) {
      return NextResponse.json({ error: 'Meta inválida' }, { status: 400 });
    }

    if (!Array.isArray(quickAdds) || quickAdds.length === 0) {
      return NextResponse.json({ error: 'Atalhos inválidos' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        waterGoal: goal,
        waterQuickAdds: JSON.stringify(quickAdds)
      }
    });

    return NextResponse.json({
      success: true,
      goal: updatedUser.waterGoal,
      quickAdds: JSON.parse(updatedUser.waterQuickAdds)
    });
  } catch (error: any) {
    console.error('Erro ao atualizar configurações de água:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
