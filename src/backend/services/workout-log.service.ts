import prisma from '@/src/lib/prisma';

export class WorkoutLogService {
  /**
   * Busca a sessão de treino de hoje.
   */
  static async getTodayWorkoutLog(userId: string, workoutId: string, startIso?: string | null, endIso?: string | null) {
    let startOfDay: Date;
    let endOfDay: Date;
    
    if (startIso && endIso) {
      startOfDay = new Date(startIso);
      endOfDay = new Date(endIso);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

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

  /**
   * Busca todas as sessões de treino de hoje para o usuário.
   */
  static async getAllTodayWorkoutLogs(userId: string, startIso?: string | null, endIso?: string | null) {
    let startOfDay: Date;
    let endOfDay: Date;
    
    if (startIso && endIso) {
      startOfDay = new Date(startIso);
      endOfDay = new Date(endIso);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    return await prisma.workoutLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        workout: true
      }
    });
  }

  /**
   * Inicia o treino criando a sessão.
   */
  static async startWorkout(userId: string, workoutId: string) {
    const allTodayLogs = await this.getAllTodayWorkoutLogs(userId);
    
    // Verifica se já existe um treino ativo (IN_PROGRESS ou CARDIO)
    const inProgressLog = allTodayLogs.find(log => log.status === 'IN_PROGRESS' || log.status === 'CARDIO');
    if (inProgressLog && inProgressLog.workoutId !== workoutId) {
      throw new Error(`Você já tem um treino em andamento: "${inProgressLog.workout.name}". Finalize-o antes de iniciar um novo.`);
    }

    const existingLog = allTodayLogs.find(log => log.workoutId === workoutId);
    if (existingLog) return existingLog;

    return await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        startTime: new Date(),
        status: "IN_PROGRESS"
      }
    });
  }

  /**
   * Atualiza o status do treino.
   */
  static async updateWorkoutStatus(userId: string, workoutId: string, status: string, hasCardio?: boolean) {
    const existingLog = await this.getTodayWorkoutLog(userId, workoutId);
    if (!existingLog) throw new Error("Treino não iniciado hoje.");

    const dataToUpdate: any = { status };
    if (status === "COMPLETED") dataToUpdate.endTime = new Date();
    if (hasCardio !== undefined) dataToUpdate.hasCardio = hasCardio;

    return await prisma.workoutLog.update({
      where: { id: existingLog.id },
      data: dataToUpdate
    });
  }

  /**
   * Desfaz a finalização (ou deleta a sessão se cancelada).
   */
  static async toggleWorkoutLog(userId: string, workoutId: string, isCompleted: boolean) {
    const existingLog = await this.getTodayWorkoutLog(userId, workoutId);
    
    if (!isCompleted) {
      if (existingLog) {
        // Volta para o estado inicial ou deleta. Vamos deletar por enquanto como o original para não quebrar a lógica de "desfazer".
        await prisma.workoutLog.delete({
          where: { id: existingLog.id }
        });
      }
      return null;
    }

    if (existingLog) {
      return await this.updateWorkoutStatus(userId, workoutId, "COMPLETED");
    }

    return await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        startTime: new Date(),
        endTime: new Date(),
        status: "COMPLETED"
      }
    });
  }
}
