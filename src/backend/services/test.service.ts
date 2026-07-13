import { testRepository } from '@/src/backend/repositories/test.repository';

export class TestService {
  /**
   * Método do serviço que processa a requisição.
   * Aqui entraria validação de regras de negócio.
   */
  async getTestMessage(name?: string | null) {
    // 1. Regra de negócio simples (exemplo)
    const greetingName = name ? name : 'Visitante';
    
    // 2. Chamada ao banco de dados através do Repository
    const dbStatus = await testRepository.getDatabaseStatus();

    // 3. Retorno dos dados formatados para o Controller
    return {
      success: true,
      message: `Olá, ${greetingName}! A arquitetura em camadas está funcionando.`,
      databaseStatus: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

export const testService = new TestService();
