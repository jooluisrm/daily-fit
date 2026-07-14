import prisma from '@/src/lib/prisma';

export class WorkoutService {
  /**
   * Obtém todos os treinos de um usuário
   */
  static async getWorkouts(userId: string) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        workoutLogs: {
          where: { status: 'COMPLETED' },
          orderBy: { date: 'desc' },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            date: true
          }
        }
      }
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

    // Validação de dias repetidos apenas para treinos ativos
    const existingWorkouts = await prisma.workout.findMany({ where: { userId, isActive: true } });
    for (const workout of existingWorkouts) {
      const existingDays: number[] = JSON.parse(workout.daysOfWeek);
      for (const day of data.daysOfWeek) {
        if (existingDays.includes(day)) {
          throw new Error(`O dia da semana já está alocado para o treino ativo "${workout.name}".`);
        }
      }
    }

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

  /**
   * Atualiza um treino
   */
  static async updateWorkout(workoutId: string, userId: string, data: { name?: string, daysOfWeek?: number[], isActive?: boolean }) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout || workout.userId !== userId) {
      throw new Error('Treino não encontrado ou não autorizado.');
    }

    // Se estiver reativando ou mudando os dias de um treino que já é ativo
    const isActivating = data.isActive === true;
    const isUpdatingDaysOfActiveWorkout = data.daysOfWeek !== undefined && (workout.isActive || isActivating);
    
    if (isActivating || isUpdatingDaysOfActiveWorkout) {
      const daysToCheck = data.daysOfWeek !== undefined ? data.daysOfWeek : JSON.parse(workout.daysOfWeek);
      const existingWorkouts = await prisma.workout.findMany({ 
        where: { 
          userId,
          isActive: true,
          id: { not: workoutId } // Ignora o próprio treino
        } 
      });
      for (const w of existingWorkouts) {
        const existingDays: number[] = JSON.parse(w.daysOfWeek);
        for (const day of daysToCheck) {
          if (existingDays.includes(day)) {
            throw new Error(`O dia da semana já está alocado para o treino ativo "${w.name}". Desative-o primeiro.`);
          }
        }
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.daysOfWeek !== undefined) updateData.daysOfWeek = JSON.stringify(data.daysOfWeek);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.workout.update({
      where: { id: workoutId },
      data: updateData
    });
  }
}
