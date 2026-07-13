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
   * Busca se o treino está finalizado em uma data específica (padrão: hoje)
   */
  static async getTodayWorkoutLog(userId: string, workoutId: string, dateString?: string | null) {
    const targetDate = dateString ? new Date(dateString) : new Date();
    // Ajustar fuso horário para evitar problemas se dateString vier como UTC
    if (dateString) {
      targetDate.setMinutes(targetDate.getMinutes() + targetDate.getTimezoneOffset());
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
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
