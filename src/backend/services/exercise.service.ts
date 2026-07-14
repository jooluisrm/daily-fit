import prisma from '@/src/lib/prisma';

export class ExerciseService {
  /**
   * Obtém todos os exercícios cadastrados no banco (Catálogo)
   */
  static async getAllExercises() {
    return prisma.exercise.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Obtém todos os exercícios de um treino específico, incluindo o histórico mais recente
   */
  static async getWorkoutExercises(workoutId: string, userId: string) {
    // 1. Verificar se o treino pertence ao usuário
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout || workout.userId !== userId) {
      throw new Error('Treino não encontrado ou não autorizado.');
    }

    // 2. Buscar exercícios do treino, ordenados pela ordem definida e trazer o último log
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { workoutId },
      orderBy: { order: 'asc' },
      include: {
        exercise: true,
        logs: {
          orderBy: { date: 'desc' },
          // Removido take: 1 para trazer o histórico completo pro gráfico
        }
      }
    });

    return workoutExercises;
  }

  /**
   * Adiciona um novo exercício ao treino
   * Se o nome do exercício não existir, ele o cria no catálogo.
   */
  static async addExerciseToWorkout(
    workoutId: string,
    userId: string,
    data: { name: string; imageUrl?: string; sets: number; reps: string }
  ) {
    // Verificar se o treino existe e pertence ao user
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });
    if (!workout || workout.userId !== userId) {
      throw new Error('Treino não encontrado ou não autorizado.');
    }

    // Buscar ou criar o Exercício Base (Case Insensitive não é direto no MySQL Prisma sem cuidados extras, faremos busca simples)
    let exercise = await prisma.exercise.findFirst({
      where: { name: data.name }
    });

    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: {
          name: data.name,
          imageUrl: data.imageUrl || null
        }
      });
    } else if (data.imageUrl && !exercise.imageUrl) {
      // Atualiza imagem caso tenha sido fornecida e o banco não tinha
      exercise = await prisma.exercise.update({
        where: { id: exercise.id },
        data: { imageUrl: data.imageUrl }
      });
    }

    // Pegar a última ordem inserida para colocar o novo exercício no final
    const lastWorkoutExercise = await prisma.workoutExercise.findFirst({
      where: { workoutId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastWorkoutExercise ? lastWorkoutExercise.order + 1 : 0;

    // Criar o vínculo WorkoutExercise
    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseId: exercise.id,
        sets: data.sets,
        reps: data.reps,
        order: nextOrder
      },
      include: {
        exercise: true,
        logs: true
      }
    });

    return workoutExercise;
  }

  /**
   * Loga a execução de um exercício (Progressive Overload)
   */
  static async logExercise(workoutExerciseId: string, userId: string, data: { setNumber: number; weight: number; repsDone: number }) {
    // Garantir que a pessoa é dona desse treino
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
      include: { workout: true }
    });

    if (!workoutExercise || workoutExercise.workout.userId !== userId) {
      throw new Error('Exercício não encontrado ou não autorizado.');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar a sessão ativa (WorkoutLog) de hoje para esse treino
    const todayWorkoutLog = await prisma.workoutLog.findFirst({
      where: {
        userId,
        workoutId: workoutExercise.workoutId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const workoutLogId = todayWorkoutLog ? todayWorkoutLog.id : undefined;

    const existingLog = await prisma.exerciseLog.findFirst({
      where: {
        workoutExerciseId,
        setNumber: data.setNumber,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingLog) {
      const updatedLog = await prisma.exerciseLog.update({
        where: { id: existingLog.id },
        data: {
          weight: data.weight,
          repsDone: data.repsDone,
          workoutLogId
        }
      });
      return updatedLog;
    }

    const log = await prisma.exerciseLog.create({
      data: {
        workoutExerciseId,
        setNumber: data.setNumber,
        weight: data.weight,
        repsDone: data.repsDone,
        workoutLogId
      }
    });

    return log;
  }

  /**
   * Atualiza os dados de um exercício do treino (ou inativa)
   */
  static async updateWorkoutExercise(
    workoutExerciseId: string,
    userId: string,
    data: { name?: string; imageUrl?: string; sets?: number; reps?: string; isActive?: boolean }
  ) {
    // Garantir que a pessoa é dona desse treino
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
      include: { workout: true, exercise: true }
    });

    if (!workoutExercise || workoutExercise.workout.userId !== userId) {
      throw new Error('Exercício não encontrado ou não autorizado.');
    }

    let currentExerciseId = workoutExercise.exerciseId;

    // Se mudou o nome ou imagem, temos que buscar/criar o Exercício base e apontar pra ele
    if (data.name || data.imageUrl) {
      const targetName = data.name || workoutExercise.exercise.name;
      let targetExercise = await prisma.exercise.findFirst({
        where: { name: targetName }
      });

      if (!targetExercise) {
        targetExercise = await prisma.exercise.create({
          data: {
            name: targetName,
            imageUrl: data.imageUrl || workoutExercise.exercise.imageUrl
          }
        });
      } else if (data.imageUrl && !targetExercise.imageUrl) {
        targetExercise = await prisma.exercise.update({
          where: { id: targetExercise.id },
          data: { imageUrl: data.imageUrl }
        });
      }
      currentExerciseId = targetExercise.id;
    }

    // Atualiza o WorkoutExercise
    const updateData: any = { exerciseId: currentExerciseId };
    if (data.sets !== undefined) updateData.sets = data.sets;
    if (data.reps !== undefined) updateData.reps = data.reps;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedWorkoutExercise = await prisma.workoutExercise.update({
      where: { id: workoutExerciseId },
      data: updateData,
      include: {
        exercise: true,
        logs: true
      }
    });

    return updatedWorkoutExercise;
  }

  /**
   * Reordena os exercícios de um treino em lote
   */
  static async reorderWorkoutExercises(workoutId: string, userId: string, orderedExerciseIds: string[]) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout || workout.userId !== userId) {
      throw new Error('Treino não encontrado ou não autorizado.');
    }

    const updatePromises = orderedExerciseIds.map((id, index) => 
      prisma.workoutExercise.update({
        where: { id },
        data: { order: index }
      })
    );

    await prisma.$transaction(updatePromises);
    
    return true;
  }
}
