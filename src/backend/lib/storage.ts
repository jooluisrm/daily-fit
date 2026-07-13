import fs from 'fs/promises';
import path from 'path';

/**
 * Interface genérica de Storage. 
 * Futuramente, se mudarmos para Vercel Blob ou S3, manteremos essa interface
 * e apenas alteraremos a implementação.
 */
export interface StorageService {
  uploadFile(fileName: string, buffer: Buffer): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private readonly uploadDir: string;

  constructor(subFolder: string = 'avatars') {
    // Aponta para a pasta public do Next.js
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
  }

  async uploadFile(fileName: string, buffer: Buffer): Promise<string> {
    // Garante que o diretório existe
    await fs.mkdir(this.uploadDir, { recursive: true });

    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Retorna a URL pública acessível pelo navegador
    return `/uploads/avatars/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extrai o nome do arquivo da URL (ex: /uploads/avatars/123.webp -> 123.webp)
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, fileName);
      
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Erro ao tentar excluir arquivo antigo: ${fileUrl}`, error);
    }
  }
}

// Instância singleton para uso em todo o backend
export const storage = new LocalStorageService();
