import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const prismaClientSingleton = () => {
  // Inicializando o adaptador do MariaDB (que se conecta ao MySQL perfeitamente)
  // O adaptador recebe a string de conexão diretamente
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
  
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
