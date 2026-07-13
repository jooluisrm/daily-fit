import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { UserService } from '@/src/backend/services/user.service';

export async function PUT(req: Request) {
  try {
    // 1. Validar Autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 2. Extrair e Validar Dados
    const data = await req.json();

    // Podemos fazer validações simples aqui ou usar o Zod futuramente
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nenhum dado enviado.' }, { status: 400 });
    }

    // 3. Atualizar no Banco de Dados
    const updatedUser = await UserService.updateProfile(session.user.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age !== undefined ? Number(data.age) : undefined,
      height: data.height !== undefined ? Number(data.height) : undefined,
      weight: data.weight !== undefined ? Number(data.weight) : undefined,
      gender: data.gender,
      // phone: data.phone, // caso adicione campo phone no db no futuro
    });

    // 4. Retornar Sucesso
    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        age: updatedUser.age,
        height: updatedUser.height,
        weight: updatedUser.weight,
        gender: updatedUser.gender,
      }
    });

  } catch (error: any) {
    console.error('Erro na atualização do perfil:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
