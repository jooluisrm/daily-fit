import { NextResponse } from 'next/server';
import { testService } from '@/src/backend/services/test.service';

/**
 * Controller: Recebe a requisição, extrai parâmetros, valida e chama o Service.
 */
export async function GET(request: Request) {
  try {
    // 1. Extração de parâmetros da requisição
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    // 2. (Opcional) Validação de dados (ex: Zod) viria aqui
    
    // 3. Chamada ao Service (lógica de negócios)
    const result = await testService.getTestMessage(name);

    // 4. Retorno de sucesso formatado
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // 5. Tratamento de Erros
    console.error('[GET /api/test] Erro interno:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}
