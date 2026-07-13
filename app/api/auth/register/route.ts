import { NextResponse } from 'next/server';
import { authService } from '@/src/backend/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Aqui poderiamos usar Zod para validação mais estrita dos dados
    const newUser = await authService.registerUser(body);

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/auth/register] Erro:', error);
    
    // Retorna a mensagem do erro (ex: "E-mail já está em uso.")
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno no servidor.' },
      { status: 400 }
    );
  }
}
