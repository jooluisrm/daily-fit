import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/src/lib/prisma';
import bcryptjs from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          image: user.image,
          restTimeGoal: user.restTimeGoal,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.age = (user as any).age;
        token.height = (user as any).height;
        token.weight = (user as any).weight;
        token.gender = (user as any).gender;
        token.restTimeGoal = (user as any).restTimeGoal;
        token.picture = user.image; // O NextAuth por padrão usa token.picture para a imagem
        token.isProfileComplete = !!(
          (user as any).firstName &&
          (user as any).age &&
          (user as any).height &&
          (user as any).weight
        );
      }
      
      // Quando o frontend chamar update() após salvar o perfil
      if (trigger === 'update' && session) {
        if (session.isProfileComplete !== undefined) token.isProfileComplete = session.isProfileComplete;
        if (session.firstName !== undefined) token.firstName = session.firstName;
        if (session.lastName !== undefined) token.lastName = session.lastName;
        if (session.age !== undefined) token.age = session.age;
        if (session.height !== undefined) token.height = session.height;
        if (session.weight !== undefined) token.weight = session.weight;
        if (session.gender !== undefined) token.gender = session.gender;
        if (session.restTimeGoal !== undefined) token.restTimeGoal = session.restTimeGoal;
        if (session.image !== undefined) token.picture = session.image; // Atualiza a foto
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).age = token.age;
        (session.user as any).height = token.height;
        (session.user as any).weight = token.weight;
        (session.user as any).gender = token.gender;
        (session.user as any).restTimeGoal = token.restTimeGoal;
        (session.user as any).isProfileComplete = token.isProfileComplete;
        if (token.picture) session.user.image = token.picture as string; // Passa a imagem pro user
      }
      return session;
    },
  },
});
