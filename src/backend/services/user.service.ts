import prisma from '@/src/lib/prisma';
import sharp from 'sharp';
import { storage } from '@/src/backend/lib/storage';

export class UserService {
  /**
   * Atualiza a foto de perfil do usuário.
   * Redimensiona, converte para webp, salva no storage e atualiza o DB.
   */
  static async updateAvatar(userId: string, imageBuffer: Buffer): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // 1. Processar a imagem com Sharp (Otimização)
    const processedBuffer = await sharp(imageBuffer)
      .resize(400, 400, {
        fit: 'cover', // Recorta a imagem centralizada se não for quadrada
        position: 'center'
      })
      .webp({ quality: 80 }) // Formato webp para altíssima compressão com boa qualidade
      .toBuffer();

    // 2. Gerar nome de arquivo único
    const fileName = `${userId}-${Date.now()}.webp`;

    // 3. Salvar nova imagem no Storage
    const newImageUrl = await storage.uploadFile(fileName, processedBuffer);

    // 4. Se o usuário já tinha uma imagem, excluímos a antiga para economizar espaço
    if (user.image && user.image.startsWith('/uploads/avatars/')) {
      await storage.deleteFile(user.image);
    }

  // 5. Atualizar no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { image: newImageUrl }
    });

    return newImageUrl;
  }

  /**
   * Remove a foto de perfil do usuário.
   */
  static async deleteAvatar(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (user.image && user.image.startsWith('/uploads/avatars/')) {
      await storage.deleteFile(user.image);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: null }
    });
  }

  /**
   * Atualiza os dados básicos do perfil do usuário.
   */
  static async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    phone?: string;
  }) {
    // Verificamos se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // Atualizamos apenas os campos fornecidos
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.age !== undefined && { age: data.age }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.gender && { gender: data.gender }),
      }
    });

    // Se atualizou o peso, cria um registro de histórico para hoje
    if (data.weight !== undefined) {
      const targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingLog = await prisma.weightLog.findFirst({
        where: {
          userId,
          date: {
            gte: targetDate,
            lte: endOfDay
          }
        }
      });

      if (existingLog) {
        await prisma.weightLog.update({
          where: { id: existingLog.id },
          data: { weight: data.weight }
        });
      } else {
        await prisma.weightLog.create({
          data: {
            userId,
            weight: data.weight,
            date: targetDate
          }
        });
      }
    }

    return updatedUser;
  }
}
