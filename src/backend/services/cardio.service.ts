import prisma from '@/src/lib/prisma';

export class CardioService {
  /**
   * Loga a atividade de cardio para o dia atual. 
   * Se já existir, atualiza. Se duration for 0 e não houver target, exclui.
   */
  static async logCardio(userId: string, data: { 
    intensity: string; 
    duration: number; 
    workoutId?: string;
    workoutLogId?: string;
    type?: string;
    targetDuration?: number;
    startTime?: Date;
    endTime?: Date;
  }) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await prisma.cardioLog.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Se a duração for 0 e não houver target, o usuário está marcando que "Não fez cardio hoje"
    if (data.duration === 0 && !data.targetDuration) {
      if (existingLog) {
        await prisma.cardioLog.delete({
          where: { id: existingLog.id }
        });
      }
      return null;
    }

    const logData = {
      intensity: data.intensity,
      duration: data.duration,
      workoutId: data.workoutId,
      workoutLogId: data.workoutLogId,
      type: data.type || "Esteira",
      targetDuration: data.targetDuration,
      startTime: data.startTime,
      endTime: data.endTime,
    };

    if (existingLog) {
      return await prisma.cardioLog.update({
        where: { id: existingLog.id },
        data: logData
      });
    }

    return await prisma.cardioLog.create({
      data: {
        userId,
        ...logData
      }
    });
  }

  /**
   * Busca o registro de cardio de hoje do usuário
   */
  static async getTodayCardio(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.cardioLog.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }
}
