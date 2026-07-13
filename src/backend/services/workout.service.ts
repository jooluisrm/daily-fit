import prisma from '@/src/lib/prisma';

export class WorkoutService {
  /**
   * Obtém todos os treinos de um usuário
   */
  static async getWorkouts(userId: string) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    return workouts;
  }

  /**
   * Cria um novo treino
   */
  static async createWorkout(userId: string, data: { name: string, daysOfWeek: number[] }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome do treino é obrigatório.');
    }

    // Como decidimos armazenar os dias da semana como JSON em String no MySQL
    const daysOfWeekString = JSON.stringify(data.daysOfWeek);

    const workout = await prisma.workout.create({
      data: {
        userId,
        name: data.name,
        daysOfWeek: daysOfWeekString
      }
    });

    return workout;
  }

  // TODO: Adicionar métodos para Update e Delete na Fase 2
}
