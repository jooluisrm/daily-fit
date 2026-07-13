import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Pega o token da sessão verificando os cookies do NextAuth
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  
  const isAuth = !!token;
  const isProfileComplete = token?.isProfileComplete as boolean | undefined;
  const path = req.nextUrl.pathname;
  
  // Rotas que não exigem login
  const isPublicRoute = path === '/' || path.startsWith('/login') || path.startsWith('/register');
  
  // Se o usuário não está autenticado e tenta acessar uma rota privada
  if (!isAuth && !isPublicRoute) {
    // Redireciona para o login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Se o usuário já está autenticado e tenta acessar rotas de login/registro
  if (isAuth && isPublicRoute) {
    // Redireciona direto para o dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // TRAP: Se o usuário está autenticado, mas o perfil está incompleto
  // Bloqueamos ele no /perfil para forçar o preenchimento dos dados.
  if (isAuth && isProfileComplete === false && !isPublicRoute && !path.startsWith('/perfil')) {
    // Opcional: passa um parâmetro para o frontend exibir um toast/alerta
    return NextResponse.redirect(new URL('/perfil?alert=incomplete', req.url));
  }

  return NextResponse.next();
}

// Configura o middleware para rodar em todas as rotas exceto arquivos estáticos e de API
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, svg, png etc (optional public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
