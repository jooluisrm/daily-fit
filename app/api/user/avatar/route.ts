import { NextResponse } from 'next/server';
import { auth } from '@/src/auth'; // Utilizamos o novo padrão do NextAuth v5
import { UserService } from '@/src/backend/services/user.service';

export async function POST(req: Request) {
  try {
    // 1. Validar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 2. Extrair form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem foi enviada.' }, { status: 400 });
    }

    // 3. Validar se é realmente uma imagem (extensão/mime)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'O arquivo enviado não é uma imagem.' }, { status: 400 });
    }

    // 4. Ler o buffer da imagem
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Chamar o serviço para processar e salvar a imagem
    const imageUrl = await UserService.updateAvatar(session.user.id, buffer);

    // 6. Retornar a URL de sucesso
    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });

  } catch (error: any) {
    console.error('Erro no upload de avatar:', error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    await UserService.deleteAvatar(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar avatar:', error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}
