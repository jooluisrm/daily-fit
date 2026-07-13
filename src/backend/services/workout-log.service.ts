import prisma from '@/src/lib/prisma';

export class WorkoutLogService {
  /**
   * Finaliza ou desfaz a finalização de um treino para o dia atual.
   */
  static async toggleWorkoutLog(userId: string, workoutId: string, isCompleted: boolean) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await prisma.workoutLog.findFirst({
      where: {
        userId,
        workoutId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (!isCompleted) {
      if (existingLog) {
        await prisma.workoutLog.delete({
          where: { id: existingLog.id }
        });
      }
      return null;
    }

    if (existingLog) {
      return existingLog; // Already completed today
    }

    return await prisma.workoutLog.create({
      data: {
        userId,
        workoutId
      }
    });
  }

  /**
   * Busca se o treino de hoje está finalizado
   */
  static async getTodayWorkoutLog(userId: string, workoutId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.workoutLog.findFirst({
      where: {
        userId,
        workoutId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }
}
