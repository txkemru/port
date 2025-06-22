import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { authorId, imageUrl, description } = await req.json();
  if (!authorId || !imageUrl) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  // Сохраняем файл в File
  const file = await prisma.file.create({ data: { url: imageUrl } });

  // Создаём пост
  const post = await prisma.post.create({
    data: {
      authorId,
      imageId: file.id,
      description,
    },
    include: {
      image: true,
    },
  });

  return NextResponse.json({ post });
} 