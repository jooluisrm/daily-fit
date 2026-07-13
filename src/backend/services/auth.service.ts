import prisma from '@/src/lib/prisma';
import bcryptjs from 'bcryptjs';

export class AuthService {
  async registerUser(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    termsAccepted: boolean;
  }) {
    const { email, password, firstName, lastName, termsAccepted } = data;

    if (!email) {
      throw new Error('E-mail é obrigatório.');
    }

    if (!termsAccepted) {
      throw new Error('Você deve aceitar os termos de uso.');
    }

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Este e-mail já está em uso.');
    }

    // Se for registro com credenciais, tem senha
    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres.');
      }
      hashedPassword = await bcryptjs.hash(password, 10);
    }

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        termsAccepted,
      },
    });

    // Retorna sem a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
